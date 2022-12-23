import { Politician } from "@prisma/client";
import axios from "axios";
import expect from "expect";
import { HTMLElement, parse } from "node-html-parser";

export type ParsedPolitician = Omit<Politician, "id">;
interface RepresentativeTitle {
  name: string;
  role: string;
  location: string;
}

/**
 * Parse a representative's title profile
 */
export function parseRepresentativeTitle(
  titleContainer: HTMLElement
): RepresentativeTitle {
  const text = titleContainer?.innerHTML
    .replaceAll("<small>", "")
    .replaceAll("</small>", "");
  expect(text).not.toBeNull();
  const lines = text!.split("<br>");
  expect(lines.length).toBeGreaterThan(1);

  const name = lines[0]!;

  // Account for additional rows that occasionally appear
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
  };
}

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
  const titleContainer = profileContainer!.querySelector(".text-primary");
  expect(titleContainer).not.toBeNull();
  const { name, role, location } = parseRepresentativeTitle(titleContainer!);

  return {
    name,
    role,
    location,
    photoUrl,
  };
}
