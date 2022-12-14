import axios from "axios";
import { execFileSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, rmSync } from "fs";
import glob from "glob";
import { MinifiedBill, TMP_DIR } from "./index";

const TMP_PDF = "./src/data/ocr/tmp/bill.pdf";
const SPLIT_SCRIPT = "./src/data/ocr/scripts/split.sh";
const OCR_SCRIPT = "./src/data/ocr/scripts/ocr.sh";

// Special characters to replace
const replacementRules = [
  [/\u000c/g, ""], // form feed (invisible character)
  [/\n\s*\n\s*\n/g, "\n\n"], // Replace multiple linebreaks with double linebreaks
] as [RegExp, string][];

/**
 * Download the bill PDF to the local tmp directory
 */
async function downloadBill(bill: MinifiedBill): Promise<void> {
  console.log("Downloading bill", bill.billNum);
  if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR);
  }

  const { sourceUrl } = bill;
  const response = await axios({
    url: sourceUrl,
    method: "GET",
    responseType: "stream",
  });

  const writer = createWriteStream(TMP_PDF);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    let error: Error | null = null;
    writer.on("error", (err) => {
      error = err;
      writer.close();
      reject(err);
    });

    writer.on("close", () => {
      if (error == null) {
        resolve();
      }
    });
  });
}

/**
 * Split the downloaded bill into separate images.
 * Deletes any pre-existing images in the `tmp` folder
 */
function splitBill() {
  console.log("Splitting bill");

  // Remove existing images
  const existing = glob.sync(`${TMP_DIR}/*.png`);
  for (const file of existing) {
    rmSync(file);
  }

  // Run pdf to image conversion script
  const result = execFileSync(SPLIT_SCRIPT).toString("utf-8");
  console.log(result);
}

/**
 * Run OCR on each image in the tmp directory
 */
function runOcr(): string {
  console.log("Running OCR");
  const files = glob.sync(`${TMP_DIR}/*.png`);
  files.sort();

  const output = [];
  for (const fileName of files) {
    const result = execFileSync(OCR_SCRIPT, [fileName]).toString("utf-8");
    output.push(result);
  }

  return output.join("\n");
}

/**
 * Apply the configured `replacementRules` to the input string
 */
function cleanText(input: string): string {
  console.log("Cleaning text");
  return replacementRules
    .reduce(
      (curr: string, [pattern, replacement]) =>
        curr.replace(pattern, replacement),
      input
    )
    .trim();
}

/**
 * Scan the specified bill and returns the string content detected from the bill
 */
export default async function scanBill(bill: MinifiedBill): Promise<string> {
  await downloadBill(bill);
  splitBill();

  const text = runOcr();
  const cleanedText = cleanText(text);
  return cleanedText;
}
