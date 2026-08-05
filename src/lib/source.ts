import { dynamicLoader } from "fumadocs-core/source/dynamic";
import { PathUtils } from "fumadocs-core/source";
import { obsidian } from "fumadocs-obsidian";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeCallouts from "rehype-callouts";
import { remarkGfm, remarkMdxMermaid } from "fumadocs-core/mdx-plugins";

const normalizeSlug = (seg: string) =>
  encodeURIComponent(seg.toLowerCase().replaceAll(" ", "-"));

const vault = obsidian({
  dir: "content/academia",
  include: [
    "**/*.md",
    "**/*.{png,jpg,jpeg,gif,svg,webp,avif,ico}",
    "**/*.{pdf,mp4,mp3,webm,wav}",
    "!**/.obsidian/**",
    "!**/.git/**",
    "!**/Excalidraw/**",
    "!**/node_modules/**",
    "!**/{Untitled,README,LICENSE}.md",
  ],
  // map vault attachments to their public URLs
  url: (path) => `/vault/${path}`,
  remarkPlugins: [remarkGfm, remarkMath, remarkMdxMermaid],
  rehypePlugins: [rehypeKatex, rehypeCallouts],
});

if (process.env.NODE_ENV === "development") {
  void vault.devServer();
}

export const source = dynamicLoader(vault.dynamicSource(), {
  baseUrl: "docs",
  slugs: (file) => {
    const dir = PathUtils.dirname(file.path);
    const name = PathUtils.basename(file.path, PathUtils.extname(file.path));
    const slugs: string[] = [];
    for (const seg of dir.split("/")) {
      if (seg.length > 0 && !/^\(.+\)$/.test(seg))
        slugs.push(normalizeSlug(seg));
    }
    if (name !== "index") slugs.push(normalizeSlug(name));
    return slugs;
  },
});

export async function getSource() {
  return source.get();
}

export async function getLLMText(
  page: Awaited<ReturnType<typeof getSource>>["$inferPage"],
) {
  return `# ${page.data.title} (${page.url})

${page.data.content}`;
}
