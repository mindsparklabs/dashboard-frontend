import Link from "next/link";
import type { ReactNode } from "react";

/** Shared shell for plain-text pages (About, Privacy) in the site's style. */
export function InfoPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="ambient-bg flex-1 w-screen px-4 py-6">
      <div className="max-w-[760px] mx-auto">
        <Link
          href="/"
          className="inline-block text-sm font-semibold mb-6 opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "#39d0ff" }}
        >
          ← Back to all sectors
        </Link>
        <h1 className="neon-heading text-4xl sm:text-5xl font-black tracking-tight mb-8">
          {title}
        </h1>
        <div
          className="flex flex-col gap-4 text-base leading-relaxed [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:mt-4 [&_h2]:text-white [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2"
          style={{ color: "#d4d4d8" }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
