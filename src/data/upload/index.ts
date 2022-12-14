import { prisma } from "../db/client";
import uploadBillHistory from "./uploadBillHistory";

async function main() {
  await uploadBillHistory(prisma);
}

main();
