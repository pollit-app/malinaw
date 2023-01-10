import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import SearchBar from "../components/SearchBar";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <main className="space-around flex min-h-screen flex-col items-center bg-slate-300">
      <div className="mt-28 flex w-screen flex-col items-center gap-10">
        <div className="flex flex-col items-center">
          <Image src="/favicon.png" height={128} width={128} alt="prism" />
          <p className="mt-5 text-center font-slab text-3xl">malinaw.ph</p>
        </div>
        <SearchBar
          className="mt-3"
          onEnter={(query) => {
            router.push({
              pathname: "/search",
              query: { query },
            });
          }}
        />
      </div>
    </main>
  );
};

export default Home;
