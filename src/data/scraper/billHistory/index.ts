import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { parse } from "node-html-parser";
import { ElementHandle, Page } from "puppeteer";
import getBrowser from "../util/getBrowser";
import parseBillHistoryRows, { BillHistory } from "./billHistoryParser";
import { loadRowIds } from "./rowIds";

const MODAL_URL = "https://www.congress.gov.ph/legisdocs/fetch_history.php";
const OUTPUT_DIR = "./src/data/scraper/output";
const BATCH_SIZE = 3;

/**
 * Request for the modal content for a specific row ID
 */
async function requestModal(rowId: string): Promise<HTMLTableRowElement[]> {
  const formData = new FormData();
  formData.append("rowid", rowId);
  const { data } = await axios({
    method: "post",
    url: MODAL_URL,
    data: formData,
  });

  const root = parse(data);
  const rows = root.querySelectorAll("tr");

  if (rows == undefined) {
    throw new Error("Could not parse history modal rows");
  }

  return rows as any;
}

/**
 * Scrape the modal for a specified row ID
 */
async function scrapeHistory(rowId: string): Promise<BillHistory> {
  const modalRows = await requestModal(rowId);
  const billHistory = parseBillHistoryRows(modalRows);

  return billHistory;
}

async function main() {
  // Parse each page
  const bills = [];
  const errors = [];
  let counter = 0;

  const rowIds = loadRowIds();

  for (const rowId of rowIds) {
    console.log("Loading", rowId);
    counter++;

    try {
      const modalRows = await requestModal(rowId);
      const billHistory = parseBillHistoryRows(modalRows);
      console.log("Loaded", rowId, billHistory.billNum);

      bills.push(billHistory);
    } catch (err) {
      errors.push(rowId);
      console.error("Error", err);
    }
  }

  fs.writeFileSync(`${OUTPUT_DIR}/bills.json`, JSON.stringify(bills, null, 2));
  console.log("Errors", errors);
  console.log("Done");
}

main();
