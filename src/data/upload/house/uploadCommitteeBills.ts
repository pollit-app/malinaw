import { PrismaClient } from "@prisma/client";
import parseCommitteeReferrals from "../../scraper/house/committees/committeeBillParser";

/**
 * Parse and upload BillCommitteeReferrals in the House of Representatives
 */
export default async function uploadCommitteeBills(
  prisma: PrismaClient
): Promise<void> {
  const committees = await prisma.committee.findMany();
  const bills = await prisma.bill.findMany();

  // Build mapping of committee names to committee IDs for faster indexing
  const committeeMapping = {} as Record<string, string>;
  for (const committee of committees) {
    committeeMapping[committee.name] = committee.id;
  }

  // Build mapping of bill names to bill IDs for faster indexing
  const billMapping = {} as Record<string, string>;
  for (const bill of bills) {
    billMapping[bill.billNum] = bill.id;
  }

  const referrals = await parseCommitteeReferrals();

  // Filter out unsupported bills/committees
  const availableReferrals = referrals.filter(
    (referral) =>
      billMapping[referral.billNum] != null &&
      committeeMapping[referral.committee] != null
  );

  // Prepare request
  const preparedReferrals = availableReferrals.map((referral) => ({
    billId: billMapping[referral.billNum]!,
    committeeId: committeeMapping[referral.committee]!,
    referralType: referral.referralType,
  }));

  // Upload into database
  await prisma.billCommitteeReferral.createMany({
    data: preparedReferrals,
  });

  // Print any unsupported referrals
  const missingCommittees = referrals.filter(
    (referral) => committeeMapping[referral.committee] == null
  );
  const missingBills = referrals.filter(
    (referral) => billMapping[referral.billNum] == null
  );
  console.log("Missing committees:", missingCommittees);
  console.log("Missing bills:", missingBills);
}
