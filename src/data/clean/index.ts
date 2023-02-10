import { program } from "commander";
import { prisma } from "../db/client";
import { cleanHouseMembers } from "./house/cleanMembers";

/**
 * Mapping of task names to task functions
 */
const tasks = {
  congressMembers: cleanHouseMembers,
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
