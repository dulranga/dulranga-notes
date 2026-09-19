import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { appName, gitConfig } from "@/lib/shared";
import { PageContainer } from "./page-container";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-50 -translate-y-24 rounded-lg bg-fd-primary px-4 py-3 text-sm text-fd-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/95 backdrop-blur-md">
        <PageContainer>
          <nav aria-label="Main navigation" className="flex min-h-16 items-center justify-between gap-3 py-2">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 rounded-md text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-fd-border bg-fd-muted">
                <BookOpen aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">{appName}</span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <SearchTrigger className="size-10" />
              <span aria-hidden="true" className="h-5 border-s border-fd-border" />
              <ThemeSwitch />
            </div>
          </nav>
        </PageContainer>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="border-t border-fd-border">
        <PageContainer>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6 text-xs leading-relaxed text-fd-muted-foreground">
            <p>{appName} <span className="px-1" aria-hidden="true">/</span> Learning, one note at a time.</p>
            <a
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-sm underline-offset-4 hover:text-fd-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
            >
              View on GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
