import type { Root } from "mdast";
import type { Plugin } from "unified";
import type { Handlers } from "mdast-util-to-hast";
import type { Element } from "hast";

const MathBlockRegex = /\$\$((?:\\.|[^$])*?)\$\$/g;

function normalizeMathBlocks(source: string): string {
  const lines = source.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    const matches = [...line.matchAll(MathBlockRegex)];
    if (matches.length === 0) {
      out.push(line);
      continue;
    }
    let last = 0;
    for (const match of matches) {
      const before = line.slice(last, match.index);
      if (before.trim().length > 0) out.push(before.trim());
      out.push("$$", match[1].trim(), "$$");
      last = match.index + match[0].length;
    }
    const after = line.slice(last);
    if (after.trim().length > 0) out.push(after.trim());
  }
  return out.join("\n");
}

/**
 * remark-math only treats `$$...$$` as block math when the delimiters sit on
 * their own lines. Obsidian renders a single-line `$$...$$` as display math,
 * and two blocks jammed together on one line (`$$a$$$$b$$`) completely break
 * the parser. Normalize the source before parsing so every `$$...$$` becomes a
 * proper multiline block.
 */
export const remarkObsidianMathBlock: Plugin = function () {
  const self = this;
  const parser = self.parser;
  if (parser) {
    self.parser = (doc, file) => parser(normalizeMathBlocks(String(doc)), file);
  }
  return () => {};
};

function toCodeElement(className: string, value: string): Element {
  return {
    type: "element",
    tagName: "code",
    properties: { className: [className] },
    children: [{ type: "text", value }],
  };
}

/**
 * Replaces the default math handlers in `remark-rehype`.
 *
 * The default handler emits `<pre><code class="language-math math-display">`,
 * which fumadocs' `rehypeCode` (Shiki) picks up before `rehypeKatex` runs and
 * swallows as a plaintext code block. Emitting a bare `<code class="math-display">`
 * (no `pre`, no `language-*` class) means Shiki skips it while `rehypeKatex`
 * still recognises it.
 */
export const mathHandlers: Handlers = {
  math(state, node) {
    return toCodeElement("math-display", node.value ?? "");
  },
  inlineMath(state, node) {
    return toCodeElement("math-inline", node.value ?? "");
  },
};
