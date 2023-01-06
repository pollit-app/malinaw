import Link from "next/link";
import type { ReactNode } from "react";

export interface ContentLayoutProps {
  children?: ReactNode;
}

export default function ContentLayout({
  children,
}: ContentLayoutProps): JSX.Element {
  return (
    <>
      <header className="bg-gray-700 p-3">
        <Link href="/" className="space-between sticky flex gap-3">
          <img src="/logo.png" className="w-8 rounded-full bg-white p-1" />
          <span className="font-slab text-2xl font-bold text-white">
            malinaw.ph
          </span>
        </Link>
      </header>
      <main className="space-around flex min-h-screen justify-center bg-slate-300">
        <div className="w-10/12 py-10">{children}</div>
      </main>
    </>
  );
}
