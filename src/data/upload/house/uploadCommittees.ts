import { PrismaClient } from "@prisma/client";
import parseCommitteeLists from "../../scraper/house/committees/committeeListParser";

/**
 * Parse and upload the list of committees in the House of Representatives
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
