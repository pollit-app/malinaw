import type { Bill, Committee, Politician } from "@prisma/client";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

interface SearchField {
  search: string;
}

interface FindManyArgs<T> {
  where?: Record<keyof T, SearchField>;
  take?: number;
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
  fields: (keyof T)[],
  limit?: number
): Promise<T[]> {
  const searchFields = {} as Record<keyof T, SearchField>;
  for (const field of fields) {
    searchFields[field] = { search: query };
  }

  return schema.findMany({
    where: searchFields,
    take: limit,
  }) as unknown as T[];
}

export const searchRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const committees = await searchFields<Committee>(
        ctx.prisma.committee,
        input.query,
        ["name"]
      );

      const bills = await searchFields<Bill>(
        ctx.prisma.bill,
        input.query,
        ["billNum", "shortTitle", "title"],
        5
      );

      const politicians = await searchFields<Politician>(
        ctx.prisma.politician,
        input.query,
        ["name", "role", "location"],
        5
      );

      return { committees, bills, politicians };
    }),
});
