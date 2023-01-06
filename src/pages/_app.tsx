import { type AppType } from "next/app";
import { Inter, Zilla_Slab } from "@next/font/google";
import clsx from "clsx";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });
const zillaSlab = Zilla_Slab({ weight: "600", subsets: ["latin"] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={clsx(inter.className)}>
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
