// Lightweight in-memory adapter for development. Replace with Convex adapter
// when CONVEX_URL and CONVEX_KEY are available.

type ID = string;

export type Todo = {
  id: ID;
  title: string;
  description?: string;
  createdAt: string; // ISO UTC
  expiresAt?: string | null;
  completedAt?: string | null;
  userId: string;
};

export type User = {
  id: string;
  email: string;
};

export type AuthCode = {
  email: string;
  code: string;
  expiresAt: number;
};

const db: {
  todos: Todo[];
  users: User[];
  authCodes: AuthCode[];
  refreshTokens: { token: string; userId: string; expiresAt: number }[];
} = {
  todos: [],
  users: [],
  authCodes: [],
  refreshTokens: [],
};

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

export const findOrCreateUser = (email: string) => {
  let u = db.users.find((x) => x.email === email);
  if (!u) {
    u = { id: Math.random().toString(36).slice(2), email };
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

export const createTodo = (todo: Omit<Todo, "id" | "createdAt">) => {
  const id = Math.random().toString(36).slice(2);
  const createdAt = new Date().toISOString();
  const t: Todo = { id, createdAt, ...todo };
  db.todos.push(t);
  return t;
};

export const listTodosForUser = (userId: string) => {
  return db.todos.filter((t) => t.userId === userId);
};

export const getTodo = (id: string) =>
  db.todos.find((t) => t.id === id) || null;

export const updateTodo = (id: string, patch: Partial<Todo>) => {
  const t = db.todos.find((x) => x.id === id);
  if (!t) return null;
  Object.assign(t, patch);
  return t;
};

export const deleteTodo = (id: string) => {
  const idx = db.todos.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  db.todos.splice(idx, 1);
  return true;
};

export default db;
