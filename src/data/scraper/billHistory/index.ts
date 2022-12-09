import { Bill } from ".prisma/client";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { ElementHandle, Page } from "puppeteer";
import getBrowser from "../util/getBrowser";
import parseBillHistoryRows from "./billHistoryParser";

const BASE_URL = "https://www.congress.gov.ph/legisdocs/?v=bills";
const MODAL_URL = "https://www.congress.gov.ph/legisdocs/fetch_history.php";
const OUTPUT_DIR = "./src/data/scraper/output";

type TableRow = ElementHandle<HTMLTableRowElement>;

/**
 * Request for the modal content for a specific row ID
 */
async function requestModal(page: Page, rowId: string): Promise<TableRow[]> {
  const formData = new FormData();
  formData.append("rowid", rowId);
  const { data } = await axios({
    method: "post",
    url: MODAL_URL,
    data: formData,
  });

  page.setContent(data);
  const rows = await page?.$$("tr");

  if (rows == undefined) {
    throw new Error("Could not parse history modal rows");
  }

  return rows as any;
}

async function main() {
  // Visit page
  const browser = await getBrowser();
  const page = await browser.newPage();
  const modalPage = await browser.newPage();

  await page.goto(BASE_URL);

  // Generate links to retrieve
  const anchors = await page.$$("a[href='#HistoryModal']");

  // Parse each page
  const bills = [];
  const errors = [];
  let counter = 0;

  for (const anchor of anchors) {
    const rowId = await anchor.evaluate((e) => e.getAttribute("data-id"));
    console.log("Loading", rowId);

    try {
      if (rowId == null) {
        throw new Error("Missing data-id on anchor!");
      }

      const modalRows = await requestModal(modalPage, rowId);
      const billHistory = await parseBillHistoryRows(modalRows);
      console.log("Loaded", rowId, billHistory.billNum);

      bills.push(billHistory);

      if (counter++ >= 5) {
        // Periodically save to disk
        fs.writeFileSync(
          `${OUTPUT_DIR}/bills.json`,
          JSON.stringify(bills, null, 2)
        );
        counter = 0;
      }
    } catch (err) {
      errors.push(rowId);
      console.error("Error", err);
      break;
    }
  }
  console.log(counter, "bills processed");

  fs.writeFileSync(`${OUTPUT_DIR}/bills.json`, JSON.stringify(bills, null, 2));
  console.log("Errors", errors);

  await page.close();
  await modalPage.close();
}

main();
