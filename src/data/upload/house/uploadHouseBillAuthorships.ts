import {
  Bill,
  BillAuthorship,
  BillAuthorshipType,
  PrismaClient,
} from "@prisma/client";
import parseBillAuthorships from "../../scraper/house/billAuthorship/billAuthorshipParser";
import { getRepresentativeUrls } from "../../scraper/house/members/listRepresentatives";

type ParsedBillAuthorship = Omit<BillAuthorship, "id">;

/**
 * Convert an array of billNum strings into an array of matching Bill objects
 * Note: order not guaranteed
 */
async function billNumstoBills(
  prisma: PrismaClient,
  billNums: string[]
): Promise<Bill[]> {
  const bills = await prisma.bill.findMany({
    where: {
      billNum: {
        in: billNums,
      },
    },
  });

  // try {
  //   // TODO: this indicates rep authored bills we don't know about
  //   expect(bills.length).toEqual(billNums.length);
  // } catch (err) {
  //   const billSet = new Set(bills.map((bill) => bill.billNum));
  //   const missingBills = billNums.filter((billNum) => !billSet.has(billNum));
  //   console.log("Missing bills: ", missingBills);
  //   throw err;
  // }

  return bills;
}

export default async function uploadCongressBillAuthorships(
  prisma: PrismaClient
): Promise<void> {
  const urls = await getRepresentativeUrls();
  for (const [i, url] of urls.entries()) {
    console.log(`Parsing politician ${i + 1}/${urls.length}`);
    const { name, principal, coAuthored } = await parseBillAuthorships(url);

    // Map parsed information to database objects
    console.log("Searching for politician", name);
    const politician = await prisma.politician.findFirstOrThrow({
      where: { name },
    });
    const principalBills = await billNumstoBills(prisma, principal);
    const coAuthoredBills = await billNumstoBills(prisma, coAuthored);

    // Map bills to billAuthorships
    const principalAuthorships = principalBills.map((bill) => ({
      billId: bill.id,
      authorId: politician.id,
      authorshipType: BillAuthorshipType.PRINCIPAL,
    })) as ParsedBillAuthorship[];
    const coAuthorships = coAuthoredBills.map((bill) => ({
      billId: bill.id,
      authorId: politician.id,
      authorshipType: BillAuthorshipType.COAUTHOR,
    })) as ParsedBillAuthorship[];
    const authorships = principalAuthorships.concat(coAuthorships);

    // Insert into database
    await prisma.billAuthorship.createMany({
      data: authorships,
      skipDuplicates: true,
    });
  }
}
