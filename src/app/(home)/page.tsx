import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, ChevronDown, Library } from "lucide-react";
import { FullSearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { PageContainer, SectionWrapper, SubjectGrid } from "@/components/layout/page-container";
import { getLibrary } from "@/lib/library";
import { appName } from "@/lib/shared";
import { getSource } from "@/lib/source";

export const metadata: Metadata = {
  title: appName,
  description: "Explore Dulranga’s academic notes, organized by semester and subject. Browse the library or search for the concept you’re learning.",
};

export default async function HomePage() {
  const source = await getSource();
  const semesters = getLibrary(source.getPageTree());
  const noteCount = semesters.reduce((total, semester) => total + semester.noteCount, 0);
  const subjectCount = semesters.reduce((total, semester) => total + semester.subjects.length, 0);

  return (
    <PageContainer>
      <SectionWrapper aria-labelledby="intro-title" className="border-b border-fd-border">
        <p className="mb-5 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-fd-muted-foreground uppercase">
          <Library aria-hidden="true" className="size-3.5" /> A personal study library
        </p>
        <h1 id="intro-title" className="max-w-3xl text-[clamp(2.25rem,5.5cqi,3.75rem)] leading-[1.08] font-semibold tracking-[-0.045em] text-balance">
          What I’m learning,<br />all in one place.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-fd-muted-foreground @3xl:text-lg">
          I’m Dulranga. These are my academic notes, collected as I learn
          and organized by semester and subject. Find a concept, revisit
          a lesson, or pick a subject and start reading.
        </p>
        <div className="mt-7 flex flex-col items-start gap-3 @xl:flex-row @xl:items-center @xl:gap-5">
          <FullSearchTrigger
            aria-label="Search all notes"
            className="min-h-12 w-full max-w-sm rounded-xl bg-fd-card px-4 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
          />
          {semesters.length > 0 && (
            <a href="#library" className="inline-flex min-h-12 items-center gap-2 rounded-md text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring">
              Explore the notes <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper id="library" aria-labelledby="library-title">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-medium tracking-[0.16em] text-fd-muted-foreground uppercase">Browse by semester</p>
            <h2 id="library-title" className="text-2xl font-semibold tracking-tight">The notes</h2>
          </div>
          <p className="text-sm text-fd-muted-foreground">
            {subjectCount} {subjectCount === 1 ? "subject" : "subjects"}
            <span aria-hidden="true" className="px-2">/</span>
            {noteCount} {noteCount === 1 ? "note" : "notes"}
          </p>
        </div>

        <div className="space-y-5">
          {semesters.map((semester, index) => (
            <details key={semester.id} open={index === 0} className="group/semester rounded-2xl border border-fd-border bg-fd-muted/20 open:pb-[clamp(--spacing(4),2.5cqi,--spacing(6))]">
              <summary className="flex min-h-20 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl p-[clamp(--spacing(4),2.5cqi,--spacing(6))] outline-none select-none focus-visible:ring-2 focus-visible:ring-fd-ring [&::-webkit-details-marker]:hidden">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-fd-border bg-fd-background font-mono text-xs text-fd-muted-foreground" aria-hidden="true">
                  {semester.number >= 0 ? String(semester.number).padStart(2, "0") : <BookOpen className="size-4" />}
                </span>
                <h3 className="min-w-0 flex-1 text-base font-semibold tracking-tight">{semester.name}</h3>
                {index === 0 && semester.number >= 0 && <span className="rounded-full border border-fd-border bg-fd-background px-2.5 py-1 text-[11px] font-medium text-fd-muted-foreground">Latest</span>}
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-fd-muted-foreground group-open/semester:rotate-180" />
              </summary>
              <div className="@container px-[clamp(--spacing(4),2.5cqi,--spacing(6))]">
                <SubjectGrid>
                  {semester.subjects.map((subject, subjectIndex) => (
                    <li key={subject.url} className="min-w-0">
                      <Link href={subject.url} className="group/card flex h-full min-h-44 flex-col rounded-xl border border-fd-border bg-fd-card p-[clamp(--spacing(5),2.5cqi,--spacing(6))] outline-none transition-colors hover:border-fd-foreground/30 hover:bg-fd-accent/40 focus-visible:ring-2 focus-visible:ring-fd-ring motion-reduce:transition-none">
                        <div className="mb-5 flex items-center justify-between text-fd-muted-foreground">
                          <BookOpen aria-hidden="true" className="size-5" strokeWidth={1.5} />
                          <span aria-hidden="true" className="font-mono text-[11px] tabular-nums">{String(subjectIndex + 1).padStart(2, "0")}</span>
                        </div>
                        <h4 className="mb-4 text-base leading-snug font-medium tracking-tight [overflow-wrap:anywhere]">{subject.name}</h4>
                        <div className="mt-auto flex items-center justify-between gap-3 text-xs text-fd-muted-foreground">
                          <span>{subject.noteCount} {subject.noteCount === 1 ? "note" : "notes"}</span>
                          <ArrowUpRight aria-hidden="true" className="size-4 group-hover/card:text-fd-foreground" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </SubjectGrid>
              </div>
            </details>
          ))}
          {semesters.length === 0 && (
            <div className="rounded-2xl border border-dashed border-fd-border p-8 text-center">
              <BookOpen aria-hidden="true" className="mx-auto mb-4 size-6 text-fd-muted-foreground" />
              <h3 className="font-medium">The library is taking shape.</h3>
              <p className="mt-2 text-sm text-fd-muted-foreground">Published notes will appear here, ready to explore.</p>
            </div>
          )}
        </div>
        {semesters.length > 0 && <p className="mt-6 text-xs leading-relaxed text-fd-muted-foreground">Pick a subject to open its notes. Use the sidebar to keep exploring.</p>}
      </SectionWrapper>
    </PageContainer>
  );
}
