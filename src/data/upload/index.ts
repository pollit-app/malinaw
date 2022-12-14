import { PrismaClient } from "@prisma/client";
import parseBillHistoryRows from "../scraper/billHistory/billHistoryParser";
import requestModal from "../scraper/billHistory/requestModal";
import { loadRowIds } from "../scraper/billHistory/rowIds";

export const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function main() {
  // Parse each page
  const errors = [];
  let counter = 0;
  const rowIds = loadRowIds();

  for (const rowId of rowIds) {
    console.log("Loading", rowId);
    counter++;

    try {
      const modalRows = await requestModal(rowId);
      const billHistory = parseBillHistoryRows(modalRows);

      await prisma.bill.create({
        data: billHistory,
      });
      console.log("Loaded", rowId, billHistory.billNum);
    } catch (err) {
      errors.push(rowId);
      console.error("Error", err);
    }
  }

  console.log("Done");
}

main();
