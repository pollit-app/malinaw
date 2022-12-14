import { PrismaClient } from "@prisma/client";
import uploadBillHistory from "./uploadBillHistory";

export const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function main() {
  await uploadBillHistory(prisma);
}

main();
