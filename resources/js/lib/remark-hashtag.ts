import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Text, Link } from 'mdast';
import { EntryType } from '@/types';

interface HashtagOptions {
  entryType: EntryType;
}

interface TextNode extends Node {
  type: 'text';
  value: string;
}

/**
 * Plugin remark para procesar las etiquetas.
 */
export default function remarkHashtag({ entryType }: HashtagOptions) {
  return (tree: Node) => {

    // Recorre el árbol buscando nodos de tipo "text".
    // Cada vez que se encuentra uno, se ejecuta el callback.
    visit(tree, 'text', (node: TextNode, index: number | null, parent: Parent | null) => {

      // Si el nodo no tiene padre o no se conoce su índice dentro del padre,
      // se retorna inmediatamente, ya que no es posible reemplazarlo con seguridad.
      if (!parent || index === null) {
        return;
      }

      // Define una expresión regular que detecte etiquetas.
      const regex = /#[a-z0-9]+/gi;

      // Guarda el contenido textual original del nodo.
      const value = node.value;

      // Inicializa un arreglo que contendrá los nuevos nodos resultantes.
      // Puede incluir nodos de texto (Text) o enlaces (Link).
      const parts: (Text | Link)[] = [];

      // Mantiene el índice del último carácter procesado dentro de la cadena.
      let lastIndex = 0;

      // Variable que almacenará cada coincidencia encontrada por la regex.
      let match;

      // Itera sobre todas las coincidencias encontradas en el texto.
      while ((match = regex.exec(value)) !== null) {

        // Si existe texto antes de la etiqueta actual,
        // se crea un nodo de texto con ese fragmento y se agrega al arreglo.
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: value.slice(lastIndex, match.index) } as Text);
        }

        // Obtiene la etiqueta completa, por ejemplo "#javascript".
        const hashtag = match[0];

        // Dependiendo del tipo de entrada,
        // la etiqueta se convierte en un enlace o se deja como texto plano.
        if (['page', 'post'].includes(entryType)) {

          // Si el contenido es una publicación o página estática,
          // se crea un nodo de tipo enlace que apunte al resultado de una
          // búsqueda por etiqueta.
          parts.push({
            type: 'link',
            url: `/search?query=${encodeURIComponent(hashtag)}`,
            children: [{ type: 'text', value: hashtag } as Text],
          } as Link);
        } else {
          // La etiqueta se mantiene como texto sin convertirlo en enlace.
          parts.push({ type: 'text', value: hashtag } as Text);
        }

        // Actualiza el índice para continuar el procesamiento
        // después de la etiqueta recién manejada.
        lastIndex = regex.lastIndex;
      }

      // Si queda texto después de la última etiqueta,
      // se agrega como un nodo de texto final.
      if (lastIndex < value.length) {
        parts.push({ type: 'text', value: value.slice(lastIndex) } as Text);
      }

      // Si se generaron nodos nuevos (texto y/o enlaces),
      // se reemplaza el nodo de texto original en el padre
      // por todos los nodos resultantes.
      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
      }
    });
  };
}