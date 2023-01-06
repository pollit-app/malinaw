import { PoliticianCommiteeMembership } from "@prisma/client";
import axios from "axios";
import parse from "node-html-parser";

interface ParsedCommitteeMembership {
  committee: string;
  title: string;
}

/**
 * Parse the committee memberships of a member of the HR
 * @param profileUrl url of the member of HR
 * @returns a list of their parsed committee memberships
 */
export default async function parseCommitteeMemberships(
  profileUrl: string
): Promise<ParsedCommitteeMembership[]> {
  const { data } = await axios.get(profileUrl);
  const root = parse(data);

  const tbody = root.querySelector("table > tbody");
  const rows = tbody?.querySelectorAll("tr");
  rows?.shift();

  const memberships = [] as ParsedCommitteeMembership[];
  const rowSplits = rows?.map((row) => row.querySelectorAll("td")) ?? [];
  for (const [committee, position] of rowSplits) {
    const committeeText = committee?.text ?? "";
    const committeeName = committeeText.slice(committeeText.indexOf(".") + 2);

    const positionText = position?.innerHTML ?? "";
    const positionName = positionText.slice(
      positionText.lastIndexOf(">") + 1,
      positionText.lastIndexOf("&")
    );

    memberships.push({
      committee: committeeName,
      title: positionName,
    });
  }

  return memberships;
}
