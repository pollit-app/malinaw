import { type AppType } from "next/app";
import { Inter, Zilla_Slab } from "@next/font/google";
import clsx from "clsx";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });
const zillaSlab = Zilla_Slab({ weight: "600", subsets: ["latin"] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={clsx(inter.className)}>
      <Head>
        <title>malinaw.ph</title>
        <meta
          name="description"
          content="Politicial transparency and accountability"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <style jsx global>
        {`
          :root {
            --zilla-slab: ${zillaSlab.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
    </main>
  );
};

export default trpc.withTRPC(MyApp);
