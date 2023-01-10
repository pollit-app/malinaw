import { router } from "../trpc";
import { billRouter } from "./bill";
import { politicianRouter } from "./politician";
import { searchRouter } from "./search";

export const appRouter = router({
  bill: billRouter,
  politician: politicianRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
