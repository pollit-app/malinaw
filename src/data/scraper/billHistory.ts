import { Bill, BillSignificance } from ".prisma/client";
import fs from "fs";
import { ElementHandle, Page } from "puppeteer";
import getBrowser from "./util/getBrowser";

const BASE_URL = "https://www.congress.gov.ph/legisdocs/?v=bills";
const OUTPUT_DIR = "./src/data/scraper/output";

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
  isBold = false,
  trimPrefix = true
): Promise<string> {
  const textSelector = isBold ? "b" : "td";
  const cell = await row?.$(textSelector);

  // Extract text from cell
  const cellText = await cell?.evaluate((element, truncate) => {
    let text = element.textContent?.trim();
    if (text?.startsWith('"')) {
      // Remove leading and trailing quotes
      text = text.substring(1, text.length - 1);
    }
    let offset = 0;
    if (truncate) {
      offset = (text?.indexOf(":") ?? -1) + 1;
    }

    return text?.substring(offset).trim();
  }, trimPrefix);

  if (cellText === undefined) {
    throw new Error("Error parsing undefined cell");
  }

  // Remove invisible characters
  const cleaned = cellText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  return cleaned;
}

/**
 * Parse rows in a Bill history modal
 */
async function parseRows(rows: BillHistoryModalRows): Promise<BillHistory> {
  let i = 0;
  const billNum = await extractText(rows[i++], true);
  const title = await extractText(rows[i++]);

  // Check if short title is present
  const line = await extractText(rows[i], false, false);
  let shortTitle = null;
  if (line.startsWith("SHORT TITLE")) {
    shortTitle = await extractText(rows[i++]);
  }
  const abstract = await extractText(rows[i++]);

  i++; // Skip principal authors line
  const dateFiled = await extractText(rows[i++]);
  const significanceStr = await extractText(rows[i++]);
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
  const status = await extractText(rows[rows.length - 1]!);

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
 * Wait for an element to be visible
 */
async function waitForElementVisible(
  page: Page,
  selector: string,
  visible: boolean
) {
  await page.waitForFunction(
    (selector: string, target: string) => {
      const element = document.querySelector(selector) as HTMLElement;
      return element.style["display"] === target;
    },
    {
      timeout: 5_000,
    },
    selector,
    visible ? "block" : "none"
  );
}

/**
 * Open the Bill history modal
 */
async function openModal(
  page: Page,
  dataId: string
): Promise<BillHistoryModalRows> {
  const anchorSelector = `a[data-id='${dataId}']`;
  // const anchor = await page.waitForSelector(`a[data-id='${dataId}']`);
  // if (anchor == null) {
  //   throw new Error(`Could not find anchor tag with data-id='${dataId}'`);
  // }
  const modalSelector = "#HistoryModal";

  for (let i = 0; i < 6; i++) {
    try {
      await page.evaluate(
        `document.querySelector("${anchorSelector}").click()`
      );
      // await page.evaluate((anchorElement) => {
      //   anchorElement.click();
      // }, anchor);
      await waitForElementVisible(page, modalSelector, true);
      break;
    } catch (err) {
      continue;
    }
  }

  const modal = await page.$(modalSelector);
  await modal?.waitForSelector("tr");
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

  for (let i = 0; i < 6; i++) {
    try {
      await page.evaluate((buttonElement) => {
        buttonElement.click();
      }, button);
      await waitForElementVisible(page, "#HistoryModal", false);
    } catch (err) {
      continue;
    }
  }
}

async function main() {
  // Visit page
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(BASE_URL);

  // Generate links to retrieve
  const anchors = await page.$$("a[href='#HistoryModal']");

  // Parse each page
  const bills = [];
  let counter = 0;
  const visited = new Set();
  const errors = [];
  for (const anchor of anchors) {
    const dataId = await anchor.evaluate((e) => e.getAttribute("data-id"));
    try {
      if (dataId == null) {
        throw new Error("Missing data-id on anchor!");
      }

      const rows = await openModal(page, dataId);
      const billHistory = await parseRows(rows as BillHistoryModalRows);
      if (visited.has(billHistory.billNum)) {
        console.log("Duplicate bill parsed:", billHistory.billNum);
        continue;
      }
      visited.add(billHistory.billNum);
      bills.push(billHistory);
      console.log("Loaded", dataId, billHistory.billNum);

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
      errors.push(dataId);
      console.error(err);
      continue;
    }
  }

  fs.writeFileSync(`${OUTPUT_DIR}/bills.json`, JSON.stringify(bills, null, 2));
  console.log("Errors", errors);

  await page.close();
}

main();
