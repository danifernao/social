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

export default function remarkHashtag({ entryType }: HashtagOptions) {
  return (tree: Node) => {
    visit(tree, 'text', (node: TextNode, index: number | null, parent: Parent | null) => {
      if (!parent || index === null) return;

      const regex = /#[a-z0-9]+/gi;
      const value = node.value;
      const parts: (Text | Link)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(value)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: value.slice(lastIndex, match.index) } as Text);
        }

        const hashtag = match[0];

        if (entryType === 'post') {
          parts.push({
            type: 'link',
            url: `/search?query=${encodeURIComponent(hashtag)}`,
            children: [{ type: 'text', value: hashtag } as Text],
          } as Link);
        } else {
          parts.push({ type: 'text', value: hashtag } as Text);
        }

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