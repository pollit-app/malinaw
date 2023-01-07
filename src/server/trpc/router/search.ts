import { Committee } from "@prisma/client";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

interface SearchField {
  search: string;
}

interface FindManyArgs<T> {
  where?: Record<keyof T, SearchField>;
}

interface SearchSchema<T> {
  findMany: (args: FindManyArgs<T>) => Promise<T[]>;
}

/**
 * Perform a text search on the schema over the specified fields
 */
async function searchFields<T>(
  schema: SearchSchema<unknown>,
  query: string,
  fields: (keyof T)[]
): Promise<T[]> {
  const searchFields = {} as Record<keyof T, SearchField>;
  for (const field of fields) {
    searchFields[field] = { search: query };
  }

  return schema.findMany({ where: searchFields }) as unknown as T[];
}

export const searchRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const committees = await searchFields(ctx.prisma.committee, input.query, [
        "name",
      ]);

      const bills = await searchFields(ctx.prisma.bill, input.query, [
        "billNum",
        // "shortTitle",
        // "title",
      ]);

      const politicians = await searchFields(
        ctx.prisma.politician,
        input.query,
        ["name", "role", "location"]
      );

      console.log("Query", input.query);
      console.log("Results", { committees, bills, politicians });
      return { committees, bills, politicians };
    }),
});
