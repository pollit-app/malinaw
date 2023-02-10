import type { PrismaClient } from "@prisma/client";

// Mapping of substrings to replace
const changeMap = [["&quot;", '"']] as const;
const changeChars = changeMap.map((entry) => entry[0]);

/**
 * Replace escaped HTML characters
 */
export async function cleanHouseMembers(prisma: PrismaClient) {
  const politicians = (await prisma.politician.findMany()) ?? [];

  // Identify politicians with characters to replace
  const updatePoliticians = politicians.filter((politician) =>
    changeChars.some((changeChar) => politician.name.includes(changeChar))
  );

  // Construct the change set
  const changeSet = updatePoliticians.map((politician) => ({
    id: politician.id,
    name: changeMap.reduce(
      (acc, changeEntry) => acc.replaceAll(changeEntry[0], changeEntry[1]),
      politician.name
    ),
  }));

  // Apply the changeset
  await prisma.$transaction(
    changeSet.map((changeEntry) =>
      prisma.politician.update({
        where: {
          id: changeEntry.id,
        },
        data: {
          name: changeEntry.name,
        },
      })
    )
  );
}
