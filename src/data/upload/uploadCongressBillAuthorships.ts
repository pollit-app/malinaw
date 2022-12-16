import parseBillAuthorships from "../scraper/congressBillAuthorships/billAuthorshipParser";
import { getRepresentativeUrls } from "../scraper/representatives/listRepresentatives";

export default async function uploadCongressBillAuthorships(): Promise<void> {
  const urls = await getRepresentativeUrls();
  await parseBillAuthorships(urls[0]!);
}
