import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const billRouter = router({
  getBill: publicProcedure
    .input(z.object({ congressNum: z.number(), billNum: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.bill.findFirstOrThrow({
        where: {
          billNum: input.billNum,
          congressNum: input.congressNum,
        },
        include: {
          committeeReferrals: {
            include: {
              committee: true,
            },
          },
          billAuthorships: {
            include: {
              author: true,
            },
            orderBy: [
              {
                authorshipType: "asc",
              },
            ],
          },
        },
      });
    }),
});
