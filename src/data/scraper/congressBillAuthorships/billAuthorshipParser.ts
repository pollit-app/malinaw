import axios from "axios";
import expect from "expect";
import { parse } from "node-html-parser";
import { parseRepresentativeTitle } from "../representatives/parseProfile";

export interface BillAuthorships {
  name: string;
  principal: string[];
  coAuthored: string[];
}

/**
 * Given the url of a member of congress, returns the name of the politician,
 * bills principally authored, and bills co-authored
 *
 * Example url: https://www.congress.gov.ph/members/search.php?id=abalos
 */
export default async function parseBillAuthorships(
  url: string
): Promise<BillAuthorships> {
  const { data } = await axios.get(url);
  const root = parse(data);

  // Extract name
  const titleContainer = root!.querySelector(".text-primary");
  expect(titleContainer).not.toBeNull();
  const { name } = parseRepresentativeTitle(titleContainer!);

  // Identify relevant lines
  const nodes = root!.querySelectorAll("h4, .panel-heading");
  const startPrincipal = nodes.findIndex((node) =>
    node.innerText.startsWith("PRINCIPAL AUTHORED BILLS")
  );
  const startCoAuthor = nodes.findIndex((node) =>
    node.innerText.startsWith("CO-AUTHORED BILLS")
  );

  // Get headings (contain bill titles)
  const principalLines = nodes
    .slice(startPrincipal, startCoAuthor)
    .filter((node) => node.classNames.includes("panel-heading"));

  const coAuthorLines = nodes
    .slice(startCoAuthor)
    .filter((node) => node.classNames.includes("panel-heading"));

  // Map heading elements to text content
  const principalBills = principalLines.map((node) => node.innerText);
  const coAuthorBills = coAuthorLines.map((node) => node.innerText);

  return {
    name,
    principal: principalBills,
    coAuthored: coAuthorBills,
  };
}
