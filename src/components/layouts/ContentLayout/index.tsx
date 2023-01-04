import Link from "next/link";
import { ReactNode } from "react";

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
      <main className="space-around flex items-center">
        <div className="w-11/12">{children}</div>
      </main>
    </>
  );
}
