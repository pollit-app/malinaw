import { MinifiedBill } from ".";
import { prisma } from "../db/client";

/**
 * Upload the fullText for the specified bill
 */
export default async function uploadBillText(
  bill: MinifiedBill,
  fullText: string
): Promise<void> {
  await prisma.bill.update({
    where: {
      id: bill.id,
    },
    data: {
      fullText,
    },
  });
}
