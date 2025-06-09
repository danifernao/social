/**
 * Complemento personalizado para Markdown.
 * Detecta etiquetas del tipo [youtube:ID] dentro del texto y las reemplaza por nodos especiales que luego se pueden convertir en IFRAMEs de YouTube.
 */

// Importa el tipo Plugin para definir un complemento de remark.
import { Plugin } from 'unified'; 

// Importa la función que permite recorrer los nodos del árbol AST (Abstract Syntax Tree).
import { visit } from 'unist-util-visit';

// Importa el tipo Literal, el cual representa nodos con un valor textual, como los nodos de texto plano.
// Importa el tipo Parent para los nodos que tienen hijos, como los párrafos.
import type { Literal, Parent } from 'unist';

// Extrae el ID de YouTube desde una URL completa o devuelve la cadena si ya es un ID.
function extractYoutubeId(value: string): string | null {
    try {
        // Si ya es un ID de 11 caracteres, simplemente lo retorna.
        if (/^[\w-]{11}$/.test(value)) {
            return value;
        }

        // Intenta crear un objeto URL a partir del valor dado.
        const url = new URL(value);

        // Compatibilidad con URLs tipo: https://www.youtube.com/watch?v=ID
        if (url.hostname.includes('youtube.com')) {
            return url.searchParams.get('v');
        }

        // Compatibilidad con URLs tipo: https://youtu.be/ID
        if (url.hostname === 'youtu.be') {
            return url.pathname.slice(1);
        }

        return null;
    } catch {
        return null;
    }
}

// Define el complemento personalizado de tipo Plugin.
const remarkYoutube: Plugin = () => {
    return (tree) => {
        // Recorre todos los nodos que sean de tipo "texto".
        visit(tree, 'text', (node, index, parent) => {
            // Si el nodo no tiene padre o el padre no contiene hijos, se detiene.
            if (!parent || !('children' in parent)) return;

            // Extrae el contenido de texto del nodo actual.
            const text = (node as Literal).value as string;

            // Busca todas las coincidencias que sigan el formato [youtube:ID_O_URL].
            const matches = [...text.matchAll(/\[youtube:([^\]]+)\]/g)];

            // Si no se encontraron coincidencias, no se realiza ningún cambio.
            if (matches.length === 0) return;

            // Arreglo que almacenará los nuevos nodos resultantes de la transformación.
            const children: any[] = [];

            // Índice para recordar dónde terminó la última coincidencia.
            let lastIndex = 0;

            // Recorre todas las coincidencias encontradas.
            for (const match of matches) {
                // Calcula el inicio y fin del texto coincidente.
                const matchStart = match.index;
                const matchEnd = matchStart + match[0].length;

                // Extrae el ID del video.
                const raw = match[1];
                const id = extractYoutubeId(raw);

                // Si no se puede extraer un ID válido, ignora.
                if (!id) continue;

                // Si hay texto antes de la coincidencia, se guarda como nodo de texto.
                if (matchStart > lastIndex) {
                    children.push({
                        type: 'text',
                        value: text.slice(lastIndex, matchStart),
                    });
                }

                // Crea un nodo personalizado con tipo "youtube" y guarda el ID del video.
                children.push({
                    type: 'youtube',
                    data: {
                        hName: 'youtube',
                        hProperties: {
                            id,
                        },
                    },
                });

                // Actualiza el índice para seguir procesando el resto del texto.
                lastIndex = matchEnd;
            }

            // Si hay texto luego de la última coincidencia, también se agrega.
            if (lastIndex < text.length) {
                children.push({
                    type: 'text',
                    value: text.slice(lastIndex),
                });
            }

            // Reemplaza el nodo original por los nuevos nodos generados.
            (parent as Parent).children.splice(index, 1, ...children);
        });
    };
};

export default remarkYoutube;