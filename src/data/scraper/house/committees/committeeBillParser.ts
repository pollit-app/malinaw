import { BillReferralType } from "@prisma/client";
import axios from "axios";
import expect from "expect";
import parse from "node-html-parser";

interface CommitteeUrl {
  committee: string;
  url: string;
}

export interface ParsedBillCommitteeReferral {
  committee: string;
  billNum: string;
  referralType: BillReferralType;
}

const BASE_URL = "https://www.congress.gov.ph/committees";
const STANDING_URL = "https://www.congress.gov.ph/committees/?v=standing";
const SPECIAL_URL = "https://www.congress.gov.ph/committees/?v=special";

/**
 * Get all the URLs for committees given either STANDING_URL or SPECIAL_URL
 */
async function getCommitteeUrls(url: string): Promise<CommitteeUrl[]> {
  const { data } = await axios.get(url);
  const root = parse(data);
  const table = root.querySelector("table");
  const rows = table?.querySelectorAll("tbody > tr") ?? [];
  rows.shift();

  // Extract names first
  const nameCells = rows.map((row) => row.querySelector("td"));
  const names = nameCells.map((cell) => cell?.text);
  const cleaned = names.map((name) =>
    name?.slice(name.indexOf(".") + 2)
  ) as string[];

  // Extract urls
  const anchors = nameCells.map((cell) => cell?.querySelector("a"));
  const urls = anchors.map((anchor) => anchor?.getAttribute("href"));
  const relPaths = urls.map((url) => url?.slice(url.lastIndexOf("/") + 1));
  const absPaths = relPaths.map((path) => BASE_URL + "/" + path);

  // Zip together
  const committeeUrls = cleaned.map((committee, i) => ({
    committee,
    url: absPaths[i]!,
  }));

  return committeeUrls;
}

/**
 * Parse all committee bills for the commitee specified by the url
 */
async function parseSingleCommitteeReferrals(
  committeeUrl: CommitteeUrl
): Promise<ParsedBillCommitteeReferral[]> {
  const { data } = await axios.get(committeeUrl.url);
  const root = parse(data);

  // Identify relevant lines
  const nodes = root!.querySelectorAll("h4, .panel-heading");

  // Yes, there is a typo in the actual site :(
  const startPrimary = nodes.findIndex((node) =>
    node.innerText.startsWith("PRIMARY REFFERED HOUSE BILLS")
  );
  const startSecondary = nodes.findIndex((node) =>
    node.innerText.startsWith("SECONDARY REFFERED HOUSE BILLS")
  );
  const endSecondary = nodes.findIndex((node) =>
    node.innerText.startsWith("SCHEDULE OF MEETINGS")
  );

  // Get headings (contain bill titles)
  const primaryLines = nodes
    .slice(startPrimary, startSecondary)
    .filter((node) => node.classNames.includes("panel-heading"));

  const secondaryLines = nodes
    .slice(startSecondary, endSecondary)
    .filter((node) => node.classNames.includes("panel-heading"));

  // Map heading elements to text content
  const primaryBills = primaryLines.map((node) => node.innerText);
  const secondaryBills = secondaryLines.map((node) => node.innerText);

  // Convert bills to referrals
  const primaryReferrals = primaryBills.map((bill) => ({
    billNum: bill,
    referralType: BillReferralType.PRIMARY,
    committee: committeeUrl.committee,
  })) as ParsedBillCommitteeReferral[];
  const secondaryReferrals = secondaryBills.map((bill) => ({
    billNum: bill,
    referralType: BillReferralType.SECONDARY,
    committee: committeeUrl.committee,
  }));

  return primaryReferrals.concat(secondaryReferrals);
}

/**
 * Parse committee bill referrals
 */
export default async function parseCommitteeReferrals(): Promise<
  ParsedBillCommitteeReferral[]
> {
  const standingUrls = await getCommitteeUrls(STANDING_URL);
  const specialUrls = await getCommitteeUrls(SPECIAL_URL);
  const urls = standingUrls.concat(specialUrls);

  let referrals = [] as ParsedBillCommitteeReferral[];
  for (const [i, url] of urls.entries()) {
    console.log("Parsing", i + 1, "/", urls.length);
    const committeeReferrals = await parseSingleCommitteeReferrals(url);
    referrals = referrals.concat(committeeReferrals);
  }

  return referrals;
}
