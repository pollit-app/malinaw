import clsx from "clsx";
import { ReactElement, useState } from "react";

export interface SearchBarProps {
  onEnter: (query: string) => void;
  className?: string;
  startQuery?: string;
}

export default function SearchBar({
  className,
  onEnter,
  startQuery,
}: SearchBarProps): ReactElement {
  const [query, setQuery] = useState(startQuery);

  return (
    <label
      className={clsx("w-12/12 relative block md:w-8/12 lg:w-4/12", className)}
    >
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
              onEnter(query);
            }
          }
        }}
      />
    </label>
  );
}
