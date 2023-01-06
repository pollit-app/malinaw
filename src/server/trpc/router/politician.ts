import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import lodash from "lodash";

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
              bill: {
                include: {
                  committeeReferrals: {
                    include: {
                      committee: true,
                    },
                  },
                },
              },
            },
          },
          memberCommittees: {
            include: {
              committee: true,
            },
          },
        },
      });

      const committeeReferrals = politician.billAuthorships
        .map((authorship) => authorship.bill.committeeReferrals)
        .flat()
        .map((referral) => referral.committee.name);

      const histogram = lodash.countBy(committeeReferrals);
      const ranked = lodash.orderBy(
        lodash.entries(histogram),
        [1, 0],
        ["desc", "asc"]
      );
      const topStances = ranked.map((entry) => entry[0]);

      return { politician, topStances };
    }),
});
