import { visit } from 'unist-util-visit'

/**
 * Convierte directivas Markdown en nodos React renderizables.
 * - :hidden[texto] -> <hidden>texto</hidden>
 * - :::hidden ... ::: -> <hidden>...</hidden>
 * - :youtube[link] -> <iframe src="..."></iframe>
 */
export default function remarkCustomDirectives() {
  return (tree: any, file: any) => {
    visit(tree, (node) => {
      // Contenido oculto
      if (node.name === "hidden") {
        node.data = {
          hName: "hidden",
          hProperties: {
            type:
              node.type === "textDirective"
                ? "inline"
                : "block",
          },
        };
      }

      // YouTube
      if (node.type === 'leafDirective' && node.name === 'youtube') {
        const url = node.children?.[0]?.value || ''
        const videoId = extractVideoID(url)
        if (!videoId) {
          node.data = {
            hName: 'span',
            hProperties: { className: 'text-red-500 font-mono' },
          };
          return;
        }

        const data = node.data || (node.data = {});
        data.hName = 'iframe';
        data.hProperties = {
          src: `https://www.youtube.com/embed/${videoId}`,
          width: 560,
          height: 315,
          frameBorder: 0,
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowFullScreen: true,
        };
        node.children = [];
      }
    })
  }
}

// Extrae el ID del video de YouTube.
function extractVideoID(url: string) {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}