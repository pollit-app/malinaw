import { Bill, BillSignificance } from ".prisma/client";
import fs from "fs";
import puppeteer, { ElementHandle, Page } from "puppeteer";

const BASE_URL = "https://www.congress.gov.ph/legisdocs/?v=bills";
const OUTPUT_DIR = "./src/data/scraper/output";
const BROWSER_URL = "http://localhost:21222";

type BillHistory = Omit<Bill, "id" | "fullText" | "sourceUrl" | "summary">;
type TableRow = ElementHandle<HTMLTableRowElement>;
type BillHistoryModalRows = [
  TableRow, // House Bill
  TableRow, // Full Title
  TableRow, // Abstract
  TableRow, // Principal Authors
  TableRow, // Date Filed
  TableRow, // Significance
  TableRow, // Co-Authors label
  ...TableRow[],
  TableRow, // Status label
  TableRow // Status text
];

/**
 * Extract text from a table row
 */
async function extractText(
  row: ElementHandle<HTMLTableRowElement> | undefined,
  prefix: string,
  isBold = false
): Promise<string> {
  const textSelector = isBold ? "b" : "td";
  const cell = await row?.$(textSelector);

  // Extract text from cell
  const text = await cell?.evaluate((element, offset) => {
    let text = element.textContent?.trim();
    if (text?.startsWith('"')) {
      // Remove leading and trailing quotes
      text = text.substring(1, text.length - 1);
    }

    return text?.substring(offset).trim();
  }, prefix.length);

  if (text === undefined) {
    throw new Error(`Error parsing undefined cell with prefix ${prefix}`);
  }

  return text;
}

/**
 * Parse rows in a Bill history modal
 */
async function parseRows(rows: BillHistoryModalRows): Promise<BillHistory> {
  let i = 0;
  const billNum = await extractText(rows[i++], "", true);
  const title = await extractText(rows[i++], "FULL TITLE : ");

  // Check if short title is present
  const line = await extractText(rows[i], "");
  let shortTitle = null;
  if (line.startsWith("SHORT TITLE")) {
    shortTitle = await extractText(rows[i++], "SHORT TITLE : ");
  }
  const abstract = await extractText(rows[i++], "ABSTRACT : ");

  i++; // Skip principal authors line
  const dateFiled = await extractText(rows[i++], "DATE FILED : ");
  const significanceStr = await extractText(rows[i++], "SIGNIFICANCE: ");
  let significance: BillSignificance = BillSignificance.NATIONAL;
  switch (significanceStr) {
    case "NATIONAL":
      break;

    case "REGIONAL":
      significance = BillSignificance.REGIONAL;
      break;

    default:
      throw new Error(
        `Unknown BillSignificance encountered: "${significanceStr}"`
      );
  }
  const status = await extractText(rows[rows.length - 1]!, "");

  return {
    billNum,
    title,
    shortTitle,
    abstract,
    dateFiled,
    significance,
    status,
  };
}

/**
 * Open the Bill history modal
 */
async function openModal(
  page: Page,
  dataId: string
): Promise<BillHistoryModalRows> {
  const anchor = await page.waitForSelector(`a[data-id='${dataId}']`);
  if (anchor == null) {
    throw new Error(`Could not find anchor tag with data-id='${dataId}'`);
  }
  await page.evaluate((anchorElement) => {
    anchorElement.click();
  }, anchor);

  const modalSelector = "#HistoryModal";
  await page.waitForSelector(modalSelector);

  const modal = await page.$(modalSelector);
  const rows = await modal?.$$("tr");

  if (rows == undefined) {
    throw new Error("Could not parse history modal rows");
  } else if (rows.length < 7) {
    throw new Error(
      `Missing rows for table modal! Expected length >= 7. Encountered ${rows.length}`
    );
  }

  return rows as any;
}

/**
 * Close the currently active modal
 */
async function closeModal(page: Page) {
  const selector = `button[data-dismiss='modal']`;
  const button = await page.waitForSelector(selector);
  if (button == undefined) {
    throw new Error("Could not find modal close button!");
  }

  await page.evaluate((buttonElement) => {
    buttonElement.click();
  }, button);
}

async function main() {
  console.log("Launching puppeteer");
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   executablePath: "/usr/bin/google-chrome",
  // });
  const browser = await puppeteer.connect({ browserURL: BROWSER_URL });
  const page = await browser.newPage();

  console.log("Visiting website");
  await page.goto(BASE_URL);

  const anchors = await page.$$("a[href='#HistoryModal']");

  const bills = [];
  let counter = 0;
  for (const anchor of anchors) {
    try {
      const dataId = await anchor.evaluate((e) => e.getAttribute("data-id"));
      if (dataId == null) {
        throw new Error("Missing data-id on anchor!");
      }

      console.log("Loading bill", dataId);
      const rows = await openModal(page, dataId);
      const billHistory = await parseRows(rows as BillHistoryModalRows);
      bills.push(billHistory);
      await closeModal(page);

      if (counter++ >= 5) {
        // Periodically save to disk
        fs.writeFileSync(
          `${OUTPUT_DIR}/bills.json`,
          JSON.stringify(bills, null, 2)
        );
        counter = 0;
      }
    } catch (err) {
      console.error(err);
      continue;
    }
  }

  fs.writeFileSync(`${OUTPUT_DIR}/bills.json`, JSON.stringify(bills, null, 2));

  await page.close();
}

main();
