// Storage proxy: delegates to in-memory `lib/db.ts` unless Convex deployment
// environment variables are present. When configured, this module calls the
// Convex HTTP function endpoints using the deployment server key so the Next
// server can validate JWTs and call Convex securely without exposing user ids.

import * as local from "./db";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const CONVEX_KEY = process.env.CONVEX_DEPLOYMENT;

const useConvex = Boolean(CONVEX_URL && CONVEX_KEY);

async function callConvex(functionPath: string, arg: any) {
  if (!useConvex) throw new Error("Convex not configured");
  const url = `${CONVEX_URL.replace(/\/+$/, "")}/api/1/function/${encodeURIComponent(
    functionPath,
  )}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONVEX_KEY}`,
    },
    body: JSON.stringify({ args: [arg] }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Convex call failed ${res.status}: ${txt}`);
  }
  const json = await res.json();
  // Expect the Convex HTTP API to return { result: <value> } or raw value.
  return json?.result ?? json;
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
  return await callConvex("functions/auth/createAuthCode", {
    email,
    code,
    ttlMs,
  });
};

export const consumeAuthCode = async (email: string, code: string) => {
  if (!useConvex) return local.consumeAuthCode(email, code);
  return await callConvex("functions/auth/consumeAuthCode", {
    email,
    code,
    now: Date.now(),
  });
};

export const findOrCreateUser = async (email: string) => {
  if (!useConvex) return local.findOrCreateUser(email);
  return await callConvex("functions/auth/findOrCreateUser", { email });
};

export const storeRefreshToken = async (
  token: string,
  userId: string,
  expiresAt: number,
) => {
  if (!useConvex) return local.storeRefreshToken(token, userId, expiresAt);
  return await callConvex("functions/auth/storeRefreshToken", {
    token,
    userId,
    expiresAt,
  });
};

export const verifyRefreshTokenStored = async (token: string) => {
  if (!useConvex) return local.verifyRefreshTokenStored(token);
  return await callConvex("functions/auth/verifyRefreshToken", { token });
};

export const createTodo = async (
  todo: Omit<local.Todo, "id" | "created_at">,
) => {
  if (!useConvex) return local.createTodo(todo);
  return await callConvex("functions/todos/createTodo", todo);
};

export const listTodosForUser = async (userId: string) => {
  if (!useConvex) return local.listTodosForUser(userId);
  return await callConvex("functions/todos/listTodosForUser", { userId });
};

export const getTodo = async (id: string) => {
  if (!useConvex) return local.getTodo(id);
  return await callConvex("functions/todos/getTodo", { todoId: id });
};

export const updateTodo = async (
  id: string,
  patch: Partial<local.Todo>,
  userId?: string,
) => {
  if (!useConvex) return local.updateTodo(id, patch);
  return await callConvex("functions/todos/updateTodo", { id, patch, userId });
};

export const deleteTodo = async (id: string, userId?: string) => {
  if (!useConvex) return local.deleteTodo(id);
  return await callConvex("functions/todos/deleteTodo", { id, userId });
};

export default local;
