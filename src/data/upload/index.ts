import { program } from "commander";
import { prisma } from "../db/client";
import uploadBillHistory from "./uploadBillHistory";
import uploadRepresentatives from "./uploadRepresentatives";

type Task = "bill" | "representatives";

/**
 * Run one of the preconfigured parse and upload tasks
 */
async function runTask(task: Task) {
  if (task === "bill") {
    await uploadBillHistory(prisma);
  } else if (task === "representatives") {
    await uploadRepresentatives(prisma);
  } else {
    throw new Error("Unknown task: " + task);
  }
}

program.argument("<task>", "task to run and upload").action(runTask);
program.parse();
