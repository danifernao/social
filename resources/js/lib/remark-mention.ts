import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Text, Link } from 'mdast';

interface TextNode extends Node {
  type: 'text';
  value: string;
}

export default function remarkMention() {
  return (tree: Node) => {
    visit(tree, 'text', (node: TextNode, index: number | null, parent: Parent | null) => {
      if (!parent || index === null) return;

      const regex = /@[a-z0-9_]+/gi;
      const value = node.value;
      const parts: (Text | Link)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(value)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: value.slice(lastIndex, match.index) } as Text);
        }

        const mention = match[0];
        const username = mention.slice(1);

        parts.push({
          type: 'link',
          url: `/user/${username}`,
          children: [{ type: 'text', value: mention } as Text],
        } as Link);

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < value.length) {
        parts.push({ type: 'text', value: value.slice(lastIndex) } as Text);
      }

      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
      }
    });
  };
}