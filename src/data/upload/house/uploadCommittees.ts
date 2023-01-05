import { PrismaClient } from "@prisma/client";
import parseCommitteeLists from "../../scraper/house/committees/committeeListParser";

/**
 * Parse members of the House of Representatives and upload into database
 */
export default async function uploadCommittees(
  prisma: PrismaClient
): Promise<void> {
  const committees = await parseCommitteeLists();
  committees.sort();

  await prisma.committee.createMany({
    data: committees,
  });
}
