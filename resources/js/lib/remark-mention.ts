import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Text, Link } from 'mdast';

interface TextNode extends Node {
  type: 'text';
  value: string;
}

/**
 * Plugin remark para procesar las menciones de usuario.
 */
export default function remarkMention() {
  return (tree: Node) => {

    // Recorre el árbol buscando nodos de tipo "text".
    // Cada vez que se encuentra uno, se ejecuta el callback.
    visit(tree, 'text', (node: TextNode, index: number | null, parent: Parent | null) => {

      // Si el nodo no tiene padre o no se conoce su índice dentro del padre,
      // se retorna inmediatamente, ya que no es posible reemplazarlo con seguridad.
      if (!parent || index === null) {
        return;
      }

      // Define una expresión regular que detecta menciones de usuario.
      const regex = /@[a-z0-9_]+/gi;

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

        // Si existe texto antes de la mención actual,
        // se crea un nodo de texto con ese fragmento y se agrega al arreglo.
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: value.slice(lastIndex, match.index) } as Text);
        }

        // Obtiene la mención completa, por ejemplo "@usuario".
        const mention = match[0];

        // Extrae el nombre de usuario eliminando el símbolo "@".
        const username = mention.slice(1);

        // Crea un nodo de tipo enlace ("link") que apunta al perfil del usuario.
        // El texto visible del enlace sigue siendo la mención original.
        parts.push({
          type: 'link',
          url: `/user/${username}`,
          children: [{ type: 'text', value: mention } as Text],
        } as Link);

        // Actualiza el índice para continuar el procesamiento
        // después de la mención recién manejada.
        lastIndex = regex.lastIndex;
      }

      // Si queda texto después de la última mención,
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