import puppeteer from "puppeteer";

const BROWSER_URL = "http://localhost:21222";

/**
 * Get a browser instance
 * @param newBrowser if true, opens up a new browser instance, otherwise,
 * connects to the browser via `BROWSER_URL`
 */
export default async function getBrowser(newBrowser = false) {
  console.log("Launching puppeteer");
  if (newBrowser) {
    return puppeteer.launch({
      headless: false,
      executablePath: "/usr/bin/google-chrome",
    });
  } else {
    return puppeteer.connect({ browserURL: BROWSER_URL });
  }
}
