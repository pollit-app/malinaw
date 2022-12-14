import { router } from "../trpc";
import { billRouter } from "./bill";

export const appRouter = router({
  bill: billRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
