import { flattenTree, type Folder, type Item, type Node, type Root } from "fumadocs-core/page-tree";
import type { ReactNode } from "react";

export interface LibrarySubject {
  name: ReactNode;
  url: string;
  noteCount: number;
}

export interface LibrarySemester {
  id: string;
  name: ReactNode;
  number: number;
  subjects: LibrarySubject[];
  noteCount: number;
}

function publishedPages(nodes: Node[]): Item[] {
  return [...new Map(
    flattenTree(nodes)
      .filter((page) => !page.external)
      .map((page) => [page.url, page]),
  ).values()];
}

function toSubject(node: Node): LibrarySubject | undefined {
  if (node.type === "separator") return;
  const pages = publishedPages([node]);
  const entry = node.type === "folder" && node.index && !node.index.external
    ? node.index
    : pages[0];
  if (!entry) return;

  return { name: node.name, url: entry.url, noteCount: pages.length };
}

function toSemester(folder: Folder): LibrarySemester | undefined {
  const children = folder.index ? [folder.index, ...folder.children] : folder.children;
  const subjects = [...new Map(children.flatMap((node) => {
    const subject = toSubject(node);
    return subject ? [[subject.url, subject] as const] : [];
  })).values()];
  if (subjects.length === 0) return;

  const rawName = folder.$ref?.folder.split("/").at(-1) ??
    (typeof folder.name === "string" ? folder.name : "");
  const match = /^semester[-_\s]+(\d+)$/i.exec(rawName);

  return {
    id: folder.$id ?? folder.$ref?.folder ?? subjects[0].url,
    name: match ? `Semester ${Number(match[1])}` : folder.name,
    number: match ? Number(match[1]) : -1,
    subjects,
    noteCount: publishedPages([folder]).length,
  };
}

/** Derive the landing library from the same published tree as the docs sidebar. */
export function getLibrary(tree: Root): LibrarySemester[] {
  const semesters = tree.children.flatMap((node) => {
    if (node.type !== "folder") return [];
    const semester = toSemester(node);
    return semester ? [semester] : [];
  });
  semesters.sort((a, b) => b.number - a.number);

  const rootNotes = tree.children.flatMap((node) => {
    if (node.type !== "page") return [];
    const subject = toSubject(node);
    return subject ? [subject] : [];
  });
  if (rootNotes.length > 0) {
    semesters.push({
      id: "other-notes",
      name: "Other notes",
      number: -1,
      subjects: rootNotes,
      noteCount: rootNotes.length,
    });
  }

  return semesters;
}
