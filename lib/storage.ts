// Storage proxy: delegates to in-memory `lib/db.ts` unless Convex deployment
// environment variables are present. When configured, this module uses the
// Convex server HTTP client (`ConvexHttpClient`) with the deployment key so
// Next.js API routes can call Convex securely. On any Convex error we fall
// back to the in-memory adapter to preserve local development.

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import * as local from "./db";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

const useConvex = Boolean(CONVEX_URL);

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
  todo: Omit<local.Todo, "id" | "createdAt">,
) => {
  if (!useConvex) return local.createTodo(todo);
  try {
    return await convexClient.mutation(
      api.functions.todos.createTodo.createTodo,
      todo,
    );
  } catch (e) {
    console.warn("Convex createTodo failed, falling back to local", e);
    return local.createTodo(todo);
  }
};

export const listTodosForUser = async (userId: string) => {
  if (!useConvex) return local.listTodosForUser(userId);
  try {
    return await convexClient.query(
      api.functions.todos.listTodosForUser.listTodosForUser,
      { userId },
    );
  } catch (e) {
    console.warn("Convex listTodosForUser failed, falling back to local", e);
    return local.listTodosForUser(userId);
  }
};

export const getTodo = async (id: string, userId: string) => {
  if (!useConvex) return local.getTodo(id);
  try {
    return await convexClient.query(api.functions.todos.getTodo.getTask, {
      todoId: id as Id<"todos">,
      userId,
    });
  } catch (e) {
    console.warn("Convex getTodo failed, falling back to local", e);
    return local.getTodo(id);
  }
};

export const updateTodo = async (
  id: string,
  patch: Partial<local.Todo>,
  userId: string,
) => {
  if (!useConvex) return local.updateTodo(id, patch);
  try {
    return await convexClient.mutation(
      api.functions.todos.updateTodo.updateTodo,
      {
        id: id as Id<"todos">,
        patch,
        userId,
      },
    );
  } catch (e) {
    console.warn("Convex updateTodo failed, falling back to local", e);
    return local.updateTodo(id, patch);
  }
};

export const deleteTodo = async (id: string, userId: string) => {
  if (!useConvex) return local.deleteTodo(id);
  try {
    return await convexClient.mutation(
      api.functions.todos.deleteTodo.deleteTodo,
      { id: id as Id<"todos">, userId },
    );
  } catch (e) {
    console.warn("Convex deleteTodo failed, falling back to local", e);
    return local.deleteTodo(id);
  }
};

export default local;
