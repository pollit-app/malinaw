import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const politicianRouter = router({
  // Get politician and bills authored
  getPoliticianData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const politician = await prisma?.politician.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });

      const bills = await prisma?.billAuthorship.findMany({
        where: {
          authorId: input.id,
        },
        include: {
          bill: true,
        },
      });

      return { politician, billsAuthored: bills };
    }),
});
