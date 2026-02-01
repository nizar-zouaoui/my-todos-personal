import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "due-task-reminders",
  { minutes: 1 },
  api.functions.push.processDue.processDue,
);

export default crons;
