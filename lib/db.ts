// Lightweight in-memory adapter for development. Replace with Convex adapter
// when CONVEX_URL and CONVEX_KEY are available.

import type { Doc, Id } from "../convex/_generated/dataModel";

export type Todo = Doc<"todos">;

type TodoPatch = Partial<
  Pick<Todo, "title" | "description" | "expiresAt" | "completedAt">
>;

export type User = {
  _id: Id<"users">;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  birthday?: number;
};

export type AuthCode = {
  email: string;
  code: string;
  expiresAt: number;
};

export type PushSubscriptionRecord = {
  _id: Id<"pushSubscriptions">;
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const db: {
  todos: Todo[];
  users: User[];
  authCodes: AuthCode[];
  refreshTokens: { token: string; userId: string; expiresAt: number }[];
  pushSubscriptions: PushSubscriptionRecord[];
} = {
  todos: [],
  users: [],
  authCodes: [],
  refreshTokens: [],
  pushSubscriptions: [],
};

const makeTodoId = (): Id<"todos"> =>
  Math.random().toString(36).slice(2) as Id<"todos">;
const makeUserId = (): Id<"users"> =>
  Math.random().toString(36).slice(2) as Id<"users">;
const makePushId = (): Id<"pushSubscriptions"> =>
  Math.random().toString(36).slice(2) as Id<"pushSubscriptions">;

export const createAuthCode = (email: string, code: string, ttlMs = 60_000) => {
  const expiresAt = Date.now() + ttlMs;
  const rec = { email, code, expiresAt };
  db.authCodes.push(rec);
  return rec;
};

export const consumeAuthCode = (email: string, code: string) => {
  const idx = db.authCodes.findIndex(
    (c) => c.email === email && c.code === code,
  );
  if (idx === -1) return false;
  const rec = db.authCodes[idx];
  if (Date.now() > rec.expiresAt) return false;
  db.authCodes.splice(idx, 1);
  return true;
};

export const getLatestAuthCodeExpiresAt = (email: string) => {
  const list = db.authCodes.filter((c) => c.email === email);
  if (list.length === 0) return null;
  return list.reduce(
    (acc, item) => (item.expiresAt > acc ? item.expiresAt : acc),
    list[0].expiresAt,
  );
};

export const getUserByEmail = (email: string) =>
  db.users.find((x) => x.email === email) || null;

export const getUserById = (id: string) =>
  db.users.find((x) => x._id === (id as Id<"users">)) || null;

export const updateUserProfile = (
  userId: string,
  profile: {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatarUrl?: string;
    birthday?: number;
  },
) => {
  const user = db.users.find((u) => u._id === (userId as Id<"users">));
  if (!user) return null;

  if (profile.username) {
    const existing = db.users.find(
      (u) => u.username === profile.username && u._id !== user._id,
    );
    if (existing) {
      throw new Error("Username is already taken.");
    }
  }

  Object.assign(user, profile);
  return user;
};

export const findOrCreateUser = (email: string) => {
  let u = db.users.find((x) => x.email === email);
  if (!u) {
    u = { _id: makeUserId(), email };
    db.users.push(u);
  }
  return u;
};

export const storeRefreshToken = (
  token: string,
  userId: string,
  expiresAt: number,
) => {
  db.refreshTokens.push({ token, userId, expiresAt });
};

export const verifyRefreshTokenStored = (token: string) => {
  const rec = db.refreshTokens.find((r) => r.token === token);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) return null;
  return rec.userId;
};

export const upsertPushSubscription = (subscription: {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) => {
  const existing = db.pushSubscriptions.find(
    (s) =>
      s.userId === subscription.userId && s.endpoint === subscription.endpoint,
  );
  if (existing) {
    existing.keys = subscription.keys;
    return existing._id;
  }
  const rec: PushSubscriptionRecord = {
    _id: makePushId(),
    userId: subscription.userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  };
  db.pushSubscriptions.push(rec);
  return rec._id;
};

export const listPushSubscriptions = (userId: string) =>
  db.pushSubscriptions.filter((s) => s.userId === userId);

export const isPushSubscribed = (userId: string, endpoint?: string) => {
  if (endpoint) {
    return db.pushSubscriptions.some(
      (s) => s.userId === userId && s.endpoint === endpoint,
    );
  }
  return db.pushSubscriptions.some((s) => s.userId === userId);
};

export const deletePushSubscriptionByEndpoint = (
  userId: string,
  endpoint: string,
) => {
  const before = db.pushSubscriptions.length;
  db.pushSubscriptions = db.pushSubscriptions.filter(
    (s) => !(s.userId === userId && s.endpoint === endpoint),
  );
  return before - db.pushSubscriptions.length;
};

export const deletePushSubscription = (id: string) => {
  const idx = db.pushSubscriptions.findIndex((s) => s._id === id);
  if (idx === -1) return false;
  db.pushSubscriptions.splice(idx, 1);
  return true;
};

export const toggleMute = (id: string, userId: string) => {
  const t = db.todos.find(
    (x) => x._id === (id as Id<"todos">) && x.userId === userId,
  );
  if (!t) return null;
  t.isMuted = !t.isMuted;
  return t;
};

export const createTodo = (
  todo: Omit<Todo, "_id" | "_creationTime" | "createdAt">,
) => {
  const _id = makeTodoId();
  const _creationTime = Date.now();
  const createdAt = new Date().toISOString();
  const t: Todo = { _id, _creationTime, createdAt, ...todo };
  db.todos.push(t);
  return t;
};

export const listTodosForUser = (userId: string) =>
  db.todos.filter((t) => t.userId === userId);

export const getTodo = (id: string, userId?: string) =>
  db.todos.find(
    (t) => t._id === (id as Id<"todos">) && (!userId || t.userId === userId),
  ) || null;

export const updateTodo = (id: string, patch: TodoPatch, userId?: string) => {
  const t = db.todos.find(
    (x) => x._id === (id as Id<"todos">) && (!userId || x.userId === userId),
  );
  if (!t) return null;
  Object.assign(t, patch);
  return t;
};

export const deleteTodo = (id: string, userId?: string) => {
  const idx = db.todos.findIndex(
    (x) => x._id === (id as Id<"todos">) && (!userId || x.userId === userId),
  );
  if (idx === -1) return false;
  db.todos.splice(idx, 1);
  return true;
};

export default db;
