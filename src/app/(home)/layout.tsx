import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: LayoutProps<'/'>) {
  return <AppShell>{children}</AppShell>;
}
