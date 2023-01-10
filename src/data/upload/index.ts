import { program } from "commander";
import { prisma } from "../db/client";
import uploadBillHistory from "./house/uploadHouseBills";
import uploadCongressBillAuthorships from "./house/uploadHouseBillAuthorships";
import uploadRepresentatives from "./house/uploadHouseRepresentatives";
import uploadCommittees from "./house/uploadCommittees";
import uploadCommitteeMemberships from "./house/uploadCommitteeMemberships";
import uploadCommitteeBills from "./house/uploadCommitteeBills";
import { PrismaClient } from "@prisma/client";

/**
 * Mapping of task names to task functions
 */
const tasks = {
  all: async (prisma: PrismaClient) => {
    await uploadBillHistory(prisma);
    await uploadRepresentatives(prisma);
    await uploadCongressBillAuthorships(prisma);
    await uploadCommittees(prisma);
    await uploadCommitteeMemberships(prisma);
    await uploadCommitteeBills(prisma);
  },
  congressMembers: uploadRepresentatives,
  congressBills: uploadBillHistory,
  congressAuthorships: uploadCongressBillAuthorships,
  congressCommittees: uploadCommittees,
  congressCommitteeMemberships: uploadCommitteeMemberships,
  congressCommitteeBills: uploadCommitteeBills,
} as const;

type Task = keyof typeof tasks;

/**
 * Run one of the preconfigured parse and upload tasks
 */
async function runTask(task: Task) {
  if (!Object.hasOwn(tasks, task)) {
    throw new Error("Unknown task: " + task);
  }
  const taskFn = tasks[task];
  await taskFn(prisma);
}

program.argument("<task>", "task to run and upload").action(runTask);
program.parse();
