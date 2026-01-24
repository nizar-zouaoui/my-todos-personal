/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_auth_consumeAuthCode from "../functions/auth/consumeAuthCode.js";
import type * as functions_auth_createAuthCode from "../functions/auth/createAuthCode.js";
import type * as functions_auth_findOrCreateUser from "../functions/auth/findOrCreateUser.js";
import type * as functions_auth_storeRefreshToken from "../functions/auth/storeRefreshToken.js";
import type * as functions_auth_verifyRefreshToken from "../functions/auth/verifyRefreshToken.js";
import type * as functions_todos_createTodo from "../functions/todos/createTodo.js";
import type * as functions_todos_deleteTodo from "../functions/todos/deleteTodo.js";
import type * as functions_todos_getTodo from "../functions/todos/getTodo.js";
import type * as functions_todos_listTodosForUser from "../functions/todos/listTodosForUser.js";
import type * as functions_todos_updateTodo from "../functions/todos/updateTodo.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/auth/consumeAuthCode": typeof functions_auth_consumeAuthCode;
  "functions/auth/createAuthCode": typeof functions_auth_createAuthCode;
  "functions/auth/findOrCreateUser": typeof functions_auth_findOrCreateUser;
  "functions/auth/storeRefreshToken": typeof functions_auth_storeRefreshToken;
  "functions/auth/verifyRefreshToken": typeof functions_auth_verifyRefreshToken;
  "functions/todos/createTodo": typeof functions_todos_createTodo;
  "functions/todos/deleteTodo": typeof functions_todos_deleteTodo;
  "functions/todos/getTodo": typeof functions_todos_getTodo;
  "functions/todos/listTodosForUser": typeof functions_todos_listTodosForUser;
  "functions/todos/updateTodo": typeof functions_todos_updateTodo;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
