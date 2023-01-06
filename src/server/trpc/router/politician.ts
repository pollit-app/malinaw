import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const politicianRouter = router({
  // Get politician and bills authored
  getPoliticianData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const politician = await ctx.prisma?.politician.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          billAuthorships: {
            include: {
              bill: true,
            },
          },
          memberCommittees: {
            include: {
              committee: true,
            },
          },
        },
      });

      return politician;
    }),
});
