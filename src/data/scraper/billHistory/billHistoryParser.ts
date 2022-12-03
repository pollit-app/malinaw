import { Bill, BillSignificance } from "@prisma/client";
import { ElementHandle } from "puppeteer";

export type BillHistory = Omit<
  Bill,
  "id" | "fullText" | "sourceUrl" | "summary"
>;
type TableRow = ElementHandle<HTMLTableRowElement>;

interface BaseSection {
  field: keyof Omit<BillHistory, "committeeReferrals">;
  fromEnd?: false;

  endPrefix?: string;
  prefix?: string;
  bold?: boolean;
  optional?: boolean;
}

interface StatusSection {
  field: "committeeReferrals";
  fromEnd: true;
  endPrefix: string;

  prefix?: string;
  bold?: boolean;
  optional?: boolean;
}

type Section = BaseSection | StatusSection;

// Expected sections in the modal
const sections: Section[] = [
  { field: "billNum", bold: true },
  { field: "title", prefix: "FULL TITLE" },
  { field: "shortTitle", prefix: "SHORT TITLE", optional: true },
  { field: "abstract", prefix: "ABSTRACT", optional: true },
  { field: "dateFiled", prefix: "DATE FILED" },
  { field: "significance", prefix: "SIGNIFICANCE" },
  { field: "committeeReferrals", fromEnd: true, endPrefix: "ACTIONS TAKEN" },
];

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
  if (section.fromEnd) {
    return !text.startsWith(section.endPrefix);
  } else {
    return (
      section.bold || // If bold, successful text extraction implies match
      section.prefix == undefined || // If no prefix, automatic match
      text.startsWith(section.prefix)
    );
  }
}

export default async function parseBillHistoryRows(
  rows: TableRow[]
): Promise<BillHistory> {
  let acc = rows;
  const billHistory = {} as Partial<BillHistory>;
  for (const section of sections) {
    const matching = [];
    while (acc.length > 0) {
      // Get the next row from start or end
      const row = section.fromEnd ? acc.pop() : acc.shift();
      if (row == undefined) {
        throw new Error("Unexpected undefined row!");
      }

      let rowText: string | undefined;
      let match = false;
      try {
        rowText = await extractTableRowText(row, section.bold ?? false);
        match = await rowTextMatchesSection(rowText, section);
      } catch (err) {
        // Unable to parse text. Match failed
        console.log("Unable to parse text");
      }

      if (match) {
        // If match, add to match set
        const trimmed = trimPrefix(rowText as string);
        matching.push(trimmed);
      } else if (section.fromEnd) {
        // If from end, break once match no longer met
        break;
      } else if (!section.optional) {
        // If match not found and section is expected, continue to next line
        continue;
      }

      if (!section.fromEnd) {
        // If not multiline and match found or section is optional
        break;
      }
    }

    if (!section.optional && matching.length == 0) {
      throw new Error(`Missing required section: ${section.field}`);
    }

    if (!section.fromEnd) {
      // Push single value
      const [value] = matching as [string];

      if (section.field === "significance") {
        billHistory[section.field] = parseBillSignificance(value);
      } else {
        billHistory[section.field] = value;
      }
    } else {
      // If fromEnd, reverse and push all values
      billHistory[section.field] = matching.reverse();
    }
  }

  return billHistory as BillHistory;
}
