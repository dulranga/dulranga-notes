import type { Break, Nodes, Root } from "mdast";
import type { Plugin } from "unified";

const BreakTag = /^<br\s*\/?>$/i;

function convert(node: Nodes) {
  if (!("children" in node)) return;
  const children = node.children as Nodes[];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === "html" && BreakTag.test(child.value.trim())) {
      children[i] = { type: "break" } satisfies Break;
    } else {
      convert(child);
    }
  }
}

/**
 * Obsidian uses `<br>` to force line breaks inside table cells, where a real
 * newline would end the row. The pipeline does not allow raw HTML through
 * remark-rehype, so those tags would otherwise be dropped silently. Turn them
 * into mdast `break` nodes, which render as `<br>`.
 */
export const remarkHtmlBreak: Plugin<[], Root> = function () {
  return (tree) => convert(tree);
};
