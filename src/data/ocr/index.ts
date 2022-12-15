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
  for await (const bill of bills) {
    const start = new Date().getTime();
    try {
      const text = await scanBill(bill);
      await uploadBillText(bill, text);
      console.log("Text length: ", text.length);
    } catch (err) {
      console.error(err);
    }
    const end = new Date().getTime();
    console.log((end - start) / 1000, "s elapsed");
  }
}

main();
