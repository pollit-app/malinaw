import { CongressHouse, type Politician } from "@prisma/client";
import axios from "axios";
import expect from "expect";
import { type HTMLElement, parse } from "node-html-parser";

export type ParsedPolitician = Omit<Politician, "id">;
interface RepresentativeTitle {
  name: string;
  role: string;
  location: string;
  additionalTitle: string | null;
  partyList: string | null;
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
  const representative = { name } as RepresentativeTitle;
  lines.shift();

  if (lines[0]?.startsWith("<a")) {
    // Additional title present
    representative.additionalTitle = parse(lines[0] as string).text;
    lines.shift();
  }

  if (lines.length === 2) {
    representative.role = lines[0]!;
    representative.location = lines[1]!;
  } else {
    representative.role = "Party List Representative";
    representative.partyList = lines[0]!;
  }

  return representative;
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
  const photoUrl = image!.getAttribute("src")!;
  expect(photoUrl).not.toBeNull();

  // Extract designation information
  const titleContainer = profileContainer!.querySelector(".text-primary");
  expect(titleContainer).not.toBeNull();
  const { name, role, location, additionalTitle, partyList } =
    parseRepresentativeTitle(titleContainer!);

  return {
    name,
    role,
    location,
    photoUrl,
    house: CongressHouse.HOUSE_OF_REPRESENTATIVES,
    profileUrl: url,
    partyList,
    additionalTitle,
  };
}
