import type { ComponentProps } from "react";

export function PageContainer({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`@container mx-auto w-full max-w-6xl px-[clamp(--spacing(5),4vw,--spacing(10))] ${className}`}
    />
  );
}

export function SectionWrapper({
  className = "",
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      {...props}
      className={`scroll-mt-24 py-[clamp(--spacing(8),5cqi,--spacing(14))] ${className}`}
    />
  );
}

export function SubjectGrid({
  className = "",
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      className={`grid grid-cols-1 gap-[clamp(--spacing(3),2cqi,--spacing(5))] @xl:grid-cols-2 @4xl:grid-cols-3 ${className}`}
    />
  );
}
