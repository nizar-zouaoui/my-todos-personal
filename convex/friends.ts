import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const searchUsers = query({
  args: { userId: v.id("users"), keyword: v.string() },
  handler: async (ctx, args) => {
    const keyword = args.keyword.trim().toLowerCase();
    if (!keyword) return [];

    const users = await ctx.db.query("users").collect();
    return users.filter((user) => {
      if (user._id === args.userId) return false;
      const username = user.username?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const firstName = user.firstName?.toLowerCase() ?? "";
      return (
        username.includes(keyword) ||
        email.includes(keyword) ||
        firstName.includes(keyword)
      );
    });
  },
});

export const sendRequest = mutation({
  args: { userId: v.id("users"), receiverId: v.id("users") },
  handler: async (ctx, args) => {
    const senderId = args.userId;
    if (senderId === args.receiverId) {
      throw new Error("Cannot send a request to yourself.");
    }

    const existingFriend = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", senderId).eq("user2", args.receiverId),
      )
      .first();

    const existingFriendReverse = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", args.receiverId).eq("user2", senderId),
      )
      .first();

    if (existingFriend || existingFriendReverse) {
      throw new Error("Users are already friends.");
    }

    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_pair", (q) =>
        q.eq("senderId", senderId).eq("receiverId", args.receiverId),
      )
      .first();

    const existingReverse = await ctx.db
      .query("friendRequests")
      .withIndex("by_pair", (q) =>
        q.eq("senderId", args.receiverId).eq("receiverId", senderId),
      )
      .first();

    if (existingRequest || existingReverse) {
      throw new Error("Friend request already exists.");
    }

    return await ctx.db.insert("friendRequests", {
      senderId,
      receiverId: args.receiverId,
      status: "pending",
    });
  },
});

export const acceptRequest = mutation({
  args: { userId: v.id("users"), requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");
    if (request.receiverId !== args.userId) {
      throw new Error("Not allowed to accept this request.");
    }

    const forward = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", request.senderId).eq("user2", request.receiverId),
      )
      .first();

    if (!forward) {
      await ctx.db.insert("friendships", {
        user1: request.senderId,
        user2: request.receiverId,
      });
    }

    const reverse = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", request.receiverId).eq("user2", request.senderId),
      )
      .first();

    if (!reverse) {
      await ctx.db.insert("friendships", {
        user1: request.receiverId,
        user2: request.senderId,
      });
    }

    await ctx.db.delete(args.requestId);
    return { ok: true };
  },
});

export const declineRequest = mutation({
  args: { userId: v.id("users"), requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");
    if (
      request.receiverId !== args.userId &&
      request.senderId !== args.userId
    ) {
      throw new Error("Not allowed to decline this request.");
    }

    await ctx.db.delete(args.requestId);
    return { ok: true };
  },
});

export const removeFriend = mutation({
  args: { userId: v.id("users"), friendUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = args.userId;

    const forward = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", currentUserId).eq("user2", args.friendUserId),
      )
      .first();

    const reverse = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", args.friendUserId).eq("user2", currentUserId),
      )
      .first();

    if (forward) await ctx.db.delete(forward._id);
    if (reverse) await ctx.db.delete(reverse._id);

    return { ok: true };
  },
});

export const listFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", args.userId))
      .collect();

    const friends = await Promise.all(
      friendships.map((friendship) => ctx.db.get(friendship.user2)),
    );

    return friends.filter(Boolean);
  },
});

export const listPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", args.userId))
      .collect();

    const senders = await Promise.all(
      requests.map((request) => ctx.db.get(request.senderId)),
    );

    return requests
      .map((request, index) => ({
        requestId: request._id,
        sender: senders[index],
        status: request.status,
      }))
      .filter((item) => Boolean(item.sender));
  },
});

export const listSentRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .collect();

    return requests.map((request) => request.receiverId);
  },
});
