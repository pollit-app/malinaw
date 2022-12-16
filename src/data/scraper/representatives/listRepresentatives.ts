import axios from "axios";
import expect from "expect";
import { parse } from "node-html-parser";

const BASE_URL = "https://www.congress.gov.ph/members";

/**
 * Get the links affiliated with all current members of the House
 */
export async function getRepresentativeUrls(): Promise<string[]> {
  const { data } = await axios.get(BASE_URL);
  const root = parse(data);
  const table = root.querySelector("table");
  expect(table).not.toBeNull();

  const rows = table!.querySelectorAll("tr");
  const members = rows.slice(1);
  const anchors = members
    .map((tableRow) => tableRow.querySelector("a"))
    .filter((anchor) => anchor != null);

  // URLs of the form "../members/search.php?id=<unique>"
  const relativeUrls = anchors.map((anchor) => anchor!.getAttribute("href")!);
  const prefix = "../members/";
  const urls = relativeUrls.map(
    (url) => `${BASE_URL}/${url.slice(prefix.length)}`
  );

  return urls;
}
