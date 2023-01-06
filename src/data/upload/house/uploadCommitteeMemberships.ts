import type {
  PoliticianCommiteeMembership,
  PrismaClient,
} from "@prisma/client";
import parseCommitteeMemberships from "../../scraper/house/committees/committeeMembershipParser";

const specialCases = {
  "East Asean Growth Area": "East ASEAN Growth Area",
} as Record<string, string>;

/**
 * Parse committee memberships of the House of Representatives and upload into database
 */
export default async function uploadCommitteeMemberships(
  prisma: PrismaClient
): Promise<void> {
  const politicians = await prisma.politician.findMany();
  const committees = await prisma.committee.findMany();

  // Build mapping of committee names to committee IDs for faster indexing
  const committeeMapping = {} as Record<string, string>;
  for (const committee of committees) {
    committeeMapping[committee.name] = committee.id;
  }

  const errors = [];
  for (const [i, politician] of politicians.entries()) {
    console.log("Parsing", i, "/", politicians.length);
    const parsedMemberships = await parseCommitteeMemberships(
      politician.profileUrl
    );

    // Replace special case committee names
    // (listed name does not match committee name)
    for (const membership of parsedMemberships) {
      if (specialCases[membership.committee] != null) {
        membership.committee = specialCases[membership.committee]!;
      }
    }

    // Note any unknown committees
    const unknown = parsedMemberships.filter(
      (parsed) => committeeMapping[parsed.committee] == null
    );
    if (unknown.length > 0) {
      console.log("Unknown committees: ", unknown);
    }

    // Ignore any if we can't lookup the committee id from the committee name
    const present = parsedMemberships.filter(
      (parsed) => committeeMapping[parsed.committee] != null
    );

    const polMemberships = present.map((parsed) => ({
      politicianId: politician.id,
      committeeId: committeeMapping[parsed.committee],
      title: parsed.title,
    })) as Omit<PoliticianCommiteeMembership, "id">[];

    // Filter out duplicates (across journals)
    const unique = new Set();
    const uniqueMemberships = [];
    for (const membership of polMemberships) {
      const id = {
        politicianId: membership.politicianId,
        committeeId: membership.committeeId,
      };
      if (!unique.has(JSON.stringify(id))) {
        unique.add(JSON.stringify(id));
        uniqueMemberships.push(membership);
      }
    }

    try {
      await prisma.politicianCommiteeMembership.createMany({
        data: uniqueMemberships,
      });
    } catch (err) {
      console.error(err);
      errors.push(i);
    }
  }

  console.log("Failures", errors);
}
