import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex schema for the todo app. Run `npx convex dev` after editing to
// regenerate `convex/_generated` types used across the codebase.

export default defineSchema({
  users: defineTable({
    email: v.string(),
  }),

  authCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  }),

  refreshTokens: defineTable({
    token: v.string(),
    userId: v.string(),
    expiresAt: v.number(),
  }),

  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    createdAt: v.string(),
    expiresAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    userId: v.string(),
  }),
});
