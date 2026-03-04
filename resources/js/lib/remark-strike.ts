import { visit } from 'unist-util-visit';

/**
 * Plugin remark para procesar tachados.
 */
export default function remarkStrike() {
  return (tree: any) => {
    // Recorre todos los nodos del árbol Markdown.
    visit(tree, 'text', (node, index, parent) => {
      const regex = /~~(.*?)~~/g;
      const matches = [...node.value.matchAll(regex)];

      // Si no hay coincidencias, no realiza ninguna transformación.
      if (!matches.length) {
        return;
      }
      
      const children = []; // Arreglo que contendrá los nuevos nodos reemplazados.
      let lastIndex = 0; // Posición procesada dentro del texto original.

      matches.forEach((match) => {
        // Extrae el texto completo de la coincidencia y el contenido interno sin los ~.
        const [full, content] = match; 

        // Obtiene la posición inicial de la coincidencia.
        const start = match.index!;

        // Calcula la posición final de la coincidencia.
        const end = start + full.length; 

        // Si existe texto antes de la coincidencia, lo conserva como nodo de texto normal.
        if (start > lastIndex) {
          children.push({ type: 'text', value: node.value.slice(lastIndex, start) });
        }

        // Inserta un nodo de tipo "delete" que representa el tachado en el árbol.
        children.push({
          type: 'delete',
          children: [{ type: 'text', value: content }],
        });

        // Actualiza la posición procesada hasta el final de la coincidencia actual.
        lastIndex = end;
      });

      // Si queda texto después de la última coincidencia, lo agrega como texto normal.
      if (lastIndex < node.value.length) {
        children.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      // Reemplaza el nodo original por los nuevos nodos generados.
      parent.children.splice(index, 1, ...children);
    });
  };
}