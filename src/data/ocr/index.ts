import { Bill } from "@prisma/client";
import { writeFileSync } from "fs";
import getBills from "./getBills";
import scanBill from "./scanBill";
import uploadBillText from "./uploadBillText";

export const BASE_DIR = "./src/data/ocr";
export const TMP_DIR = "./src/data/ocr/tmp";

export type MinifiedBill = Pick<Bill, "id" | "sourceUrl" | "billNum">;

/**
 * Perform OCR on all bills in the database with missing `fullText` fields
 * and populates them
 */
export default async function main() {
  const bills = getBills();
  const errors = [];
  for await (const bill of bills) {
    try {
      const text = await scanBill(bill);
      await uploadBillText(bill, text);
    } catch (err) {
      console.error(err);
      errors.push(bill.billNum);
    }
  }

  writeFileSync(
    `${BASE_DIR}/output/ocr_errors.json`,
    JSON.stringify(errors, null, 2)
  );
}

main();
