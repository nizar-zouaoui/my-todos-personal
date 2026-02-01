import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "due-task-reminders",
  { minutes: 60 },
  api.functions.push.processDue.processDue,
);

crons.interval(
  "deleteExpiredAuthCodes",
  { hours: 1 },
  internal.functions.auth.deleteExpiredCodes.deleteExpiredCodes,
);

export default crons;
