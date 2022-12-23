import { PrismaClient } from "@prisma/client";
import { getRepresentativeUrls } from "../scraper/house/members/listRepresentatives";
import parseProfile, {
  ParsedPolitician,
} from "../scraper/house/members/parseProfile";

/**
 * Parse members of the House of Representatives and upload into database
 */
export default async function uploadRepresentatives(
  prisma: PrismaClient
): Promise<void> {
  const urls = await getRepresentativeUrls();

  const parsedProfiles = [] as ParsedPolitician[];
  // Parse sequentially to avoid throttling
  for (const [i, url] of urls.entries()) {
    console.log(`Parsing profile ${i + 1}/${urls.length}`);
    const profile = await parseProfile(url);
    parsedProfiles.push(profile);
    if (i == 22) {
      console.log(profile);
    }
  }

  await prisma.politician.createMany({
    data: parsedProfiles,
  });
  console.log("Done");
}
