import { prisma } from "../db/client";

export const BASE_DIR = "./src/data/ocr";
export const TMP_DIR = `${BASE_DIR}/tmp`;

const BATCH_SIZE = 100;

/**
 * Create a generator for all bills without text.
 * Hides the pagination implementation for cleaner use
 */
export default async function* getBills() {
  let bills = await prisma.bill.findMany({
    where: {
      fullText: null,
    },
    select: {
      id: true,
      sourceUrl: true,
      billNum: true,
    },
    orderBy: {
      billNum: "asc",
    },
    take: BATCH_SIZE,
  });

  while (bills.length > 0) {
    for (const bill of bills) {
      yield bill;
    }
    const cursor = bills[bills.length - 1]?.id;
    bills = await prisma.bill.findMany({
      where: {
        fullText: null,
      },
      select: {
        id: true,
        sourceUrl: true,
        billNum: true,
      },
      orderBy: {
        billNum: "asc",
      },
      take: BATCH_SIZE,
      skip: 1,
      cursor: {
        id: cursor,
      },
    });
  }
}
