import { Bill, BillSignificance } from "@prisma/client";
import { ElementHandle } from "puppeteer";

export type BillHistory = Omit<
  Bill,
  "id" | "fullText" | "sourceUrl" | "summary"
>;
type TableRow = ElementHandle<HTMLTableRowElement>;

interface Section {
  field: keyof Omit<BillHistory, "committeeReferrals">;
  endPrefix?: string;
  prefix?: string;
  bold?: boolean;
  optional?: boolean;
}

// Expected sections in the modal
const sections: Section[] = [
  { field: "billNum", bold: true },
  { field: "title", prefix: "FULL TITLE" },
  { field: "shortTitle", prefix: "SHORT TITLE", optional: true },
  { field: "abstract", prefix: "ABSTRACT", optional: true },
  { field: "dateFiled", prefix: "DATE FILED" },
  { field: "significance", prefix: "SIGNIFICANCE" },
];

const END_MARKER = "ACTIONS TAKEN";
const END_FIELD = "committeeReferrals";

/**
 * Extract text from a table row
 */
async function extractTableRowText(
  row: ElementHandle<HTMLTableRowElement> | undefined,
  isBold = false
): Promise<string> {
  const textSelector = isBold ? "b" : "td";
  const cell = await row?.$(textSelector);

  // Extract text from cell
  const cellText = await cell?.evaluate((element) => {
    return element.textContent?.trim();
  });

  if (cellText === undefined) {
    throw new Error("Error parsing undefined cell");
  }

  // Remove invisible characters
  let cleaned = cellText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  // Convert nbsp to space
  cleaned = cellText.replace(/\u00a0/g, " ");

  // Remove leading/trailing quotes, if present
  if (cleaned.startsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }

  return cleaned;
}

/**
 * Remove any label prefixes from the string, identified by the ':' character
 */
function trimPrefix(text: string): string {
  // Remove all characters up to the first ":", if it exists
  const offset = (text.indexOf(":") ?? -1) + 1;
  return text.substring(offset).trim();
}

/**
 * Convert a raw bill significance string into a BillSignificance instance
 */
function parseBillSignificance(significanceStr: string): BillSignificance {
  switch (significanceStr) {
    case "NATIONAL":
      return BillSignificance.NATIONAL;

    case "LOCAL":
      return BillSignificance.LOCAL;

    default:
      throw new Error(
        `Unknown BillSignificance encountered: "${significanceStr}"`
      );
  }
}

/**
 * Returns true if the specified row text matches the current section
 */
async function rowTextMatchesSection(
  text: string,
  section: Section
): Promise<boolean> {
  return (
    section.bold || // If bold, successful text extraction implies match
    section.prefix == undefined || // If no prefix, automatic match
    text.startsWith(section.prefix)
  );
}

async function parseSections(
  rows: TableRow[]
): Promise<[TableRow[], Partial<BillHistory>]> {
  let acc = rows;
  const billHistory = {} as Partial<BillHistory>;

  for (const section of sections) {
    while (acc.length > 0) {
      // Get the next row from start
      const row = acc.shift();
      if (row == undefined) {
        throw new Error("Unexpected undefined row!");
      }

      try {
        const rowText = await extractTableRowText(row, section.bold ?? false);
        const match = await rowTextMatchesSection(rowText, section);

        if (match) {
          // If match, set field in billHistory
          const trimmed = trimPrefix(rowText as string);

          // Parse significance into enum, as required
          if (section.field === "significance") {
            billHistory[section.field] = parseBillSignificance(trimmed);
          } else {
            billHistory[section.field] = trimmed;
          }
          break;
        } else if (!section.optional) {
          // If match not found and section is required, continue to next line
          continue;
        }
      } catch (err) {
        // Unable to parse text. Match failed
        console.log("Unable to parse text");
      }
    }

    if (!section.optional && acc.length == 0) {
      throw new Error(`Missing required section: ${section.field}`);
    }
  }

  return [acc, billHistory];
}

async function parseEnd(rows: TableRow[]): Promise<Partial<BillHistory>> {
  let acc = rows;
  const billHistory = {} as Partial<BillHistory>;
  const matching = [];
  while (acc.length > 0) {
    const row = acc.pop();
    try {
      const rowText = await extractTableRowText(row);

      if (rowText.startsWith(END_MARKER)) {
        // Marker reached. Break
        break;
      } else {
        matching.push(rowText);
      }
    } catch (err) {
      // Unable to parse text. Match failed
      console.log("Unable to parse text");
    }
  }

  billHistory[END_FIELD] = matching.reverse();
  return billHistory;
}

export default async function parseBillHistoryRows(
  rows: TableRow[]
): Promise<BillHistory> {
  const [remainingRows, partialHistory] = await parseSections(rows);
  const endHistory = await parseEnd(remainingRows);

  const billHistory = {
    ...partialHistory,
    ...endHistory,
  };

  return billHistory as BillHistory;
}
