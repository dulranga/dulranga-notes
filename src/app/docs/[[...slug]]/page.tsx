import { getSource } from "@/lib/source";
import { notFound, redirect } from "next/navigation";
import { flattenTree } from "fumadocs-core/page-tree";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import * as ObsidianComponents from "fumadocs-obsidian/ui";
import { DocsBody, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";

import type { Metadata } from "next";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const source = await getSource();
  const page = source.getPage(params.slug);

  if (page) {
    const { body, toc } = await (
      await page.data.load()
    ).render({
      ...defaultMdxComponents,
      ...ObsidianComponents,
      a: createRelativeLink(source, page),
    });

    return (
      <DocsPage toc={toc}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsBody>{body}</DocsBody>
      </DocsPage>
    );
  }

  if (!params.slug || params.slug.length === 0) {
    const first = flattenTree(source.getPageTree().children)[0];
    if (first) redirect(first.url);
  }

  notFound();
}

export async function generateStaticParams() {
  const source = await getSource();
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const source = await getSource();
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
