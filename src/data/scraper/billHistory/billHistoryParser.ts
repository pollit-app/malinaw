import { Bill, BillSignificance } from "@prisma/client";
import { ElementHandle } from "puppeteer";

export type BillHistory = Omit<
  Bill,
  "id" | "fullText" | "sourceUrl" | "summary"
>;

interface Section {
  field: keyof Omit<BillHistory, "committeeReferrals">;
  prefix: string;
  delimeter?: string;
  optional?: boolean;
}

// Expected sections in the modal
const sections: Section[] = [
  { field: "billNum", prefix: "House Bill/Resolution NO.", delimeter: "." },
  { field: "title", prefix: "FULL TITLE" },
  { field: "shortTitle", prefix: "SHORT TITLE", optional: true },
  { field: "abstract", prefix: "ABSTRACT", optional: true },
  { field: "dateFiled", prefix: "DATE FILED" },
  { field: "significance", prefix: "SIGNIFICANCE" },
];

const END_MARKER = "ACTIONS TAKEN";
const END_FIELD = "committeeReferrals";

// Special characters to replace
const specialChars = [
  [/[\u0000-\u001F\u007F-\u009F]/g, ""], // invisible characters
  [/\u00a0/g, " "], // nbsp
  [/\ufffd/g, "\u00f1"], // n with tilde
] as [RegExp, string][];

/**
 * Extract text from a table row
 */
function extractTableRowText(row: HTMLTableRowElement | undefined): string {
  // Extract text from cell
  const cellText = row?.textContent?.trim();

  if (cellText === undefined) {
    throw new Error("Error parsing undefined cell");
  }

  // Replace special characters
  let cleaned = specialChars.reduce(
    (curr: string, [pattern, replacement]) =>
      curr.replace(pattern, replacement),
    cellText
  );

  // Remove leading/trailing quotes, if present
  if (cleaned.startsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }

  return cleaned;
}

/**
 * Remove any label prefixes from the string, identified by the delimeter
 */
function trimPrefix(text: string, delim = ":"): string {
  // Remove all characters up to the first delimeter, if it exists
  const offset = (text.indexOf(delim) ?? -1) + 1;
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
function rowTextMatchesSection(text: string, section: Section): boolean {
  return text.startsWith(section.prefix);
}

function parseSections(
  rows: HTMLTableRowElement[]
): [HTMLTableRowElement[], Partial<BillHistory>] {
  // Reverse rows to pop from end
  let acc = [...rows];
  acc.reverse();
  const billHistory = {} as Partial<BillHistory>;

  for (const section of sections) {
    let match = false;
    while (acc.length > 0) {
      // Get the next row from start
      const row = acc.pop();
      if (row == undefined) {
        throw new Error("Unexpected undefined row!");
      }

      try {
        const rowText = extractTableRowText(row);
        match = rowTextMatchesSection(rowText, section);

        if (match) {
          // If match, set field in billHistory
          const trimmed = trimPrefix(rowText as string, section.delimeter);

          // Parse significance into enum, as required
          if (section.field === "significance") {
            billHistory[section.field] = parseBillSignificance(trimmed);
          } else {
            billHistory[section.field] = trimmed;
          }
          break;
        } else if (section.optional) {
          // If section optional and match not found, push back row and try checking using next section
          acc.push(row);
          break;
        } else {
          // If match not found and section is required, continue to next line
          continue;
        }
      } catch (err) {
        // Unable to parse text. Match failed
        console.log("Unable to parse text");
      }
    }

    if (!section.optional && !match) {
      throw new Error(`Missing required section: ${section.field}`);
    }
  }

  // Unreverse acc
  acc.reverse();
  return [acc, billHistory];
}

function parseEnd(rows: HTMLTableRowElement[]): Partial<BillHistory> {
  let acc = rows;
  const billHistory = {} as Partial<BillHistory>;
  const matching = [];

  while (acc.length > 0) {
    const row = acc.pop();
    try {
      const rowText = extractTableRowText(row);

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

export default function parseBillHistoryRows(
  rows: HTMLTableRowElement[]
): BillHistory {
  const [remainingRows, partialHistory] = parseSections(rows);
  const endHistory = parseEnd(remainingRows);

  const billHistory = {
    ...partialHistory,
    ...endHistory,
  };

  return billHistory as BillHistory;
}
