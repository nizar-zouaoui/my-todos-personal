import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex schema for the todo app. Run `npx convex dev` after editing to
// regenerate `convex/_generated` types used across the codebase.

export default defineSchema({
  users: defineTable({
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    birthday: v.optional(v.number()),
  }).index("by_username", ["username"]),

  friendRequests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    status: v.string(),
  })
    .index("by_receiver", ["receiverId"])
    .index("by_sender", ["senderId"])
    .index("by_pair", ["senderId", "receiverId"]),

  friendships: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"])
    .index("by_pair", ["user1", "user2"]),

  authCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  }).index("by_expiresAt", ["expiresAt"]),

  refreshTokens: defineTable({
    token: v.string(),
    userId: v.string(),
    expiresAt: v.number(),
  }),

  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  }),

  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    createdAt: v.string(),
    expiresAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    isNotified: v.optional(v.boolean()),
    isMuted: v.optional(v.boolean()),
    userId: v.string(),
  }),
});
