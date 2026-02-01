// Storage proxy: delegates to in-memory `lib/db.ts` unless Convex deployment
// environment variables are present. When configured, this module uses the
// Convex server HTTP client (`ConvexHttpClient`) with the deployment URL so
// Next.js API routes can call Convex securely. On any Convex error we fall
// back to the in-memory adapter to preserve local development.

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import * as local from "./db";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

const useConvex = Boolean(CONVEX_URL);

type ConvexTodo = Doc<"todos">;

// Initialize a single Convex HTTP client when configured.
let convexClient: ConvexHttpClient | null = null;
if (useConvex) {
  try {
    convexClient = new ConvexHttpClient(CONVEX_URL);
  } catch (e) {
    console.warn(
      "Failed to initialize Convex client, falling back to local",
      e,
    );
    convexClient = null;
  }
}
// Exported functions mirror `lib/db.ts`. If Convex is configured we call
// corresponding Convex functions under `functions/*`. Otherwise fall back to
// the in-memory adapter for local development.

export const createAuthCode = async (
  email: string,
  code: string,
  ttlMs = 60_000,
) => {
  if (!useConvex) return local.createAuthCode(email, code, ttlMs);
  try {
    return await convexClient.mutation(
      api.functions.auth.createAuthCode.createAuthCode,
      {
        email,
        code,
        expiresAt: Date.now() + ttlMs,
      },
    );
  } catch (e) {
    console.warn("Convex createAuthCode failed, falling back to local", e);
    return local.createAuthCode(email, code, ttlMs);
  }
};

export const consumeAuthCode = async (email: string, code: string) => {
  if (!useConvex) return local.consumeAuthCode(email, code);
  try {
    return await convexClient.mutation(
      api.functions.auth.consumeAuthCode.consumeAuthCode,
      { email, code, now: Date.now() },
    );
  } catch (e) {
    console.warn("Convex consumeAuthCode failed, falling back to local", e);
    return local.consumeAuthCode(email, code);
  }
};

export const getLatestAuthCodeExpiresAt = async (email: string) => {
  if (!useConvex) return local.getLatestAuthCodeExpiresAt(email);
  try {
    const result = await convexClient.query(
      api.functions.auth.getLatestAuthCode.getLatestAuthCode,
      { email },
    );
    return result?.expiresAt ?? null;
  } catch (e) {
    console.warn("Convex getLatestAuthCode failed, falling back to local", e);
    return local.getLatestAuthCodeExpiresAt(email);
  }
};

export const getUserByEmail = async (email: string) => {
  if (!useConvex) return local.getUserByEmail(email);
  try {
    return await convexClient.query(api.functions.users.getByEmail.getByEmail, {
      email,
    });
  } catch (e) {
    console.warn("Convex getUserByEmail failed, falling back to local", e);
    return local.getUserByEmail(email);
  }
};

export const findOrCreateUser = async (email: string) => {
  if (!useConvex) return local.findOrCreateUser(email);
  try {
    return await convexClient.mutation(
      api.functions.auth.findOrCreateUser.findOrCreateUser,
      { email },
    );
  } catch (e) {
    console.warn("Convex findOrCreateUser failed, falling back to local", e);
    return local.findOrCreateUser(email);
  }
};

export const storeRefreshToken = async (
  token: string,
  userId: string,
  expiresAt: number,
) => {
  if (!useConvex) return local.storeRefreshToken(token, userId, expiresAt);
  try {
    return await convexClient.mutation(
      api.functions.auth.storeRefreshToken.storeRefreshToken,
      {
        token,
        userId,
        expiresAt,
      },
    );
  } catch (e) {
    console.warn("Convex storeRefreshToken failed, falling back to local", e);
    return local.storeRefreshToken(token, userId, expiresAt);
  }
};

type PushKeys = { p256dh: string; auth: string };
type PushSubscriptionRecord = {
  userId: string;
  endpoint: string;
  keys: PushKeys;
};

export const upsertPushSubscription = async (
  subscription: PushSubscriptionRecord,
) => {
  if (!useConvex) return local.upsertPushSubscription(subscription);
  try {
    return await convexClient.mutation(api.functions.push.subscribe.subscribe, {
      userId: subscription.userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });
  } catch (e) {
    console.warn("Convex subscribe failed, falling back to local", e);
    return local.upsertPushSubscription(subscription);
  }
};

export const listPushSubscriptions = async (userId: string) => {
  if (!useConvex) return local.listPushSubscriptions(userId);
  try {
    return await convexClient.query(api.functions.push.listByUser.listByUser, {
      userId,
    });
  } catch (e) {
    console.warn(
      "Convex listPushSubscriptions failed, falling back to local",
      e,
    );
    return local.listPushSubscriptions(userId);
  }
};

export const deletePushSubscription = async (id: string) => {
  if (!useConvex) return local.deletePushSubscription(id);
  try {
    await convexClient.mutation(
      api.functions.push.deleteSubscription.deleteSubscription,
      {
        id: id as Id<"pushSubscriptions">,
      },
    );
    return true;
  } catch (e) {
    console.warn(
      "Convex deletePushSubscription failed, falling back to local",
      e,
    );
    return local.deletePushSubscription(id);
  }
};

export const isPushSubscribed = async (userId: string, endpoint?: string) => {
  if (!useConvex) return local.isPushSubscribed(userId, endpoint);
  try {
    return await convexClient.query(
      api.functions.push.isSubscribed.isSubscribed,
      {
        userId,
        endpoint,
      },
    );
  } catch (e) {
    console.warn("Convex isSubscribed failed, falling back to local", e);
    return local.isPushSubscribed(userId, endpoint);
  }
};

export const unsubscribePush = async (userId: string, endpoint: string) => {
  if (!useConvex)
    return local.deletePushSubscriptionByEndpoint(userId, endpoint);
  try {
    return await convexClient.mutation(
      api.functions.push.unsubscribe.unsubscribe,
      {
        userId,
        endpoint,
      },
    );
  } catch (e) {
    console.warn("Convex unsubscribe failed, falling back to local", e);
    return local.deletePushSubscriptionByEndpoint(userId, endpoint);
  }
};

export const verifyRefreshTokenStored = async (token: string) => {
  if (!useConvex) return local.verifyRefreshTokenStored(token);
  try {
    return await convexClient.query(
      api.functions.auth.verifyRefreshToken.verifyRefreshToken,
      { token },
    );
  } catch (e) {
    console.warn("Convex verifyRefreshToken failed, falling back to local", e);
    return local.verifyRefreshTokenStored(token);
  }
};

export const createTodo = async (
  todo: Omit<local.Todo, "_id" | "_creationTime" | "createdAt">,
) => {
  if (!useConvex) return local.createTodo(todo);
  try {
    const created = await convexClient.mutation(
      api.functions.todos.createTodo.createTodo,
      todo,
    );
    return created as ConvexTodo;
  } catch (e) {
    console.warn("Convex createTodo failed, falling back to local", e);
    return local.createTodo(todo);
  }
};

export const listTodosForUser = async (userId: string) => {
  if (!useConvex) return local.listTodosForUser(userId);
  try {
    const list = await convexClient.query(
      api.functions.todos.listTodosForUser.listTodosForUser,
      { userId },
    );
    return list as ConvexTodo[];
  } catch (e) {
    console.warn("Convex listTodosForUser failed, falling back to local", e);
    return local.listTodosForUser(userId);
  }
};

export const getTodo = async (id: string, userId: string) => {
  if (!useConvex) return local.getTodo(id, userId);
  try {
    const doc = await convexClient.query(api.functions.todos.getTodo.getTask, {
      todoId: id as Id<"todos">,
      userId,
    });
    return doc as ConvexTodo | null;
  } catch (e) {
    console.warn("Convex getTodo failed, falling back to local", e);
    return local.getTodo(id, userId);
  }
};

export const updateTodo = async (
  id: string,
  patch: Partial<
    Pick<local.Todo, "title" | "description" | "expiresAt" | "completedAt">
  >,
  userId: string,
) => {
  if (!useConvex) return local.updateTodo(id, patch, userId);
  try {
    const doc = await convexClient.mutation(
      api.functions.todos.updateTodo.updateTodo,
      {
        id: id as Id<"todos">,
        patch,
        userId,
      },
    );
    return doc as ConvexTodo | null;
  } catch (e) {
    console.warn("Convex updateTodo failed, falling back to local", e);
    return local.updateTodo(id, patch, userId);
  }
};

export const toggleMute = async (id: string, userId: string) => {
  if (!useConvex) return local.toggleMute(id, userId);
  try {
    return await convexClient.mutation(
      api.functions.todos.toggleMute.toggleMute,
      {
        id: id as Id<"todos">,
        userId,
      },
    );
  } catch (e) {
    console.warn("Convex toggleMute failed, falling back to local", e);
    return local.toggleMute(id, userId);
  }
};

export const deleteTodo = async (id: string, userId: string) => {
  if (!useConvex) return local.deleteTodo(id, userId);
  try {
    await convexClient.mutation(api.functions.todos.deleteTodo.deleteTodo, {
      id: id as Id<"todos">,
      userId,
    });
    return true;
  } catch (e) {
    console.warn("Convex deleteTodo failed, falling back to local", e);
    return local.deleteTodo(id, userId);
  }
};

export default local;
