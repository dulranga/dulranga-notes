import { redirect } from "next/navigation";
import { flattenTree } from "fumadocs-core/page-tree";
import { getSource } from "@/lib/source";

export default async function Page() {
  const source = await getSource();
  const first = flattenTree(source.getPageTree().children)[0];
  if (first) redirect(first.url);
  redirect("/");
}
