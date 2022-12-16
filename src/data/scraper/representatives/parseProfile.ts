import { Politician } from "@prisma/client";
import axios from "axios";
import expect from "expect";
import { parse } from "node-html-parser";

export type ParsedPolitician = Omit<Politician, "id">;

/**
 * Parse a representative's profile page
 */
export default async function parseProfile(
  url: string
): Promise<ParsedPolitician> {
  const { data } = await axios.get(url);
  const root = parse(data);

  const profileContainer = root.querySelector(".congInfo");
  expect(profileContainer).not.toBeNull();

  // Extract photoUrl
  const image = profileContainer!.querySelector("img");
  const photoUrl = image?.getAttribute("src")!;
  expect(photoUrl).not.toBeNull();

  // Extract designation information
  const title = profileContainer!.querySelector(".text-primary");
  const text = title?.innerHTML
    .replaceAll("<small>", "")
    .replaceAll("</small>", "");
  expect(text).not.toBeNull();
  const lines = text!.split("<br>");
  expect(lines.length).toBeGreaterThan(1);

  const name = lines[0]!;

  let role = "Party List Representative";
  let location = lines[1]!;
  if (lines.length == 3) {
    role = lines[1]!;
    location = lines[2]!;
  } else if (lines.length == 4) {
    role = lines[2]!;
    location = lines[3]!;
  }

  return {
    name,
    role,
    location,
    photoUrl,
  };
}
