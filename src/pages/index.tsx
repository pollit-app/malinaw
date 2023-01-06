import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState<string>();

  return (
    <main className="space-around flex min-h-screen flex-col items-center bg-slate-300">
      <div className="mt-28 flex w-screen flex-col items-center gap-10">
        <div className="flex flex-col items-center">
          <Image src="/favicon.png" height={128} width={128} alt="prism" />
          <p className="mt-5 text-center font-slab text-3xl">malinaw.ph</p>
        </div>
        <label className="relative mt-3 block w-4/12">
          <span className="sr-only">Search</span>
          <span className="absolute inset-y-0 left-0 flex items-center px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </span>
          <input
            className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-5 shadow-sm placeholder:italic placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
            placeholder="Search for anything"
            type="text"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (query != null) {
                  router.push({
                    pathname: "/search",
                    query: { query },
                  });
                }
              }
            }}
          />
        </label>
      </div>
    </main>
  );
};

export default Home;
