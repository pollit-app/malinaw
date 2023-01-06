import { router } from "../trpc";
import { billRouter } from "./bill";
import { politicianRouter } from "./politician";

export const appRouter = router({
  bill: billRouter,
  politician: politicianRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
