import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import { Root, Node, Literal } from 'mdast';
import {
  TextDirective,
  LeafDirective,
  ContainerDirective,
} from 'mdast-util-directive';

// Constantes
const colors = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-400',
  gray: 'text-gray-500',
};

const sizes = {
  small: 'text-sm',
  large: 'text-lg',
};

// Tipos
type ColorKey = keyof typeof colors;
type SizeKey = keyof typeof sizes;
type DirectiveNode = TextDirective | LeafDirective | ContainerDirective;

// Guardas de tipo
function isDirective(node: Node): node is DirectiveNode {
  return (
    node.type === 'textDirective' ||
    node.type === 'leafDirective' ||
    node.type === 'containerDirective'
  );
}

function isLiteral(node: Node): node is Literal {
  return 'value' in node;
}

// --- Plugin ---

/**
 * Convierte directivas Markdown en nodos React renderizables.
 */
export default function remarkCustomDirectives() {
  return (tree: Root, file: VFile) => {
    visit(tree, (node: Node) => {
      if (isDirective(node)) {
        // Color y tamaño de fuente
        if (node.name === 'style' && node.type === 'textDirective') {
          const styleNode = node as TextDirective;
          const attrs = styleNode.attributes || {};

          const colorAttr = attrs.color as ColorKey | undefined;
          const sizeAttr = attrs.size as SizeKey | undefined;

          const colorClass = colorAttr && colorAttr in colors ? colors[colorAttr] : '';
          const sizeClass = sizeAttr && sizeAttr in sizes ? sizes[sizeAttr] : '';

          node.data = {
            hName: 'span',
            hProperties: {
              className: [colorClass, sizeClass].join(' '),
            },
          };
        }

        // Contenido oculto
        if (node.name === 'hidden' && (node.type === 'textDirective' || node.type === 'containerDirective')) {
          const hiddenNode = node as TextDirective | ContainerDirective;
          hiddenNode.data = {
            hName: 'hidden',
            hProperties: {
              type:
                hiddenNode.type === 'textDirective'
                  ? 'inline'
                  : 'block',
            },
          };
        }

        // YouTube
        if (node.type === 'leafDirective' && node.name === 'youtube') {
          const youtubeNode = node as LeafDirective;
          
          let url = '';
          const firstChild = youtubeNode.children?.[0];
          
          if (firstChild && isLiteral(firstChild)) {
              url = firstChild.value;
          }

          const videoId = extractVideoID(url);
          if (!videoId) {
            youtubeNode.data = {
              hName: 'span',
            };
            return;
          }

          const data = youtubeNode.data || (youtubeNode.data = {});
          data.hName = 'iframe';
          data.hProperties = {
            src: `https://www.youtube.com/embed/${videoId}`,
            width: 560,
            height: 315,
            frameBorder: 0,
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
          };
          youtubeNode.children = [];
        }
      }
    });
  };
}

// Extrae el ID del video de YouTube.
function extractVideoID(url: string): string {
  const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}