import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import findByIdOrThrow from "../util/findByIdOrThrow";

export const billRouter = router({
  getBill: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return findByIdOrThrow(ctx.prisma.bill, input.id);
    }),
});
