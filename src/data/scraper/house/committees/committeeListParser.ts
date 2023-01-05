import { Committee, CongressHouse } from "@prisma/client";
import axios from "axios";
import { parse } from "node-html-parser";

export type ParsedCommittee = Omit<Committee, "id">;

const STANDING_URL = "https://www.congress.gov.ph/committees/?v=standing";
const SPECIAL_URL = "https://www.congress.gov.ph/committees/?v=special";

async function parseTable(url: string): Promise<string[]> {
  const { data } = await axios.get(url);
  const root = parse(data);
  const table = root.querySelector("table");
  const rows = table?.querySelectorAll("tbody > tr");
  rows?.shift();

  const nameCells = rows?.map((row) => row.querySelector("td")) ?? [];
  const names = nameCells.map((cell) => cell?.text);
  const cleaned = names.map((name) =>
    name?.slice(name.indexOf(".") + 2)
  ) as string[];

  return cleaned;
}

/**
 * Parse the list of committees from the House of Representatives
 */
export default async function parseCommitteeLists(): Promise<
  ParsedCommittee[]
> {
  const standing = await parseTable(STANDING_URL);
  const special = await parseTable(SPECIAL_URL);

  const committeeNames = standing.concat(special);
  const committees = committeeNames.map((name) => ({
    name,
    house: CongressHouse.HOUSE_OF_REPRESENTATIVES,
  }));

  return committees;
}
