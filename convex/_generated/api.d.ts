/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as friends from "../friends.js";
import type * as functions_auth_consumeAuthCode from "../functions/auth/consumeAuthCode.js";
import type * as functions_auth_createAuthCode from "../functions/auth/createAuthCode.js";
import type * as functions_auth_deleteExpiredCodes from "../functions/auth/deleteExpiredCodes.js";
import type * as functions_auth_findOrCreateUser from "../functions/auth/findOrCreateUser.js";
import type * as functions_auth_getLatestAuthCode from "../functions/auth/getLatestAuthCode.js";
import type * as functions_auth_storeRefreshToken from "../functions/auth/storeRefreshToken.js";
import type * as functions_auth_verifyRefreshToken from "../functions/auth/verifyRefreshToken.js";
import type * as functions_push_deleteSubscription from "../functions/push/deleteSubscription.js";
import type * as functions_push_isSubscribed from "../functions/push/isSubscribed.js";
import type * as functions_push_listByUser from "../functions/push/listByUser.js";
import type * as functions_push_listDueTodos from "../functions/push/listDueTodos.js";
import type * as functions_push_markNotified from "../functions/push/markNotified.js";
import type * as functions_push_processDue from "../functions/push/processDue.js";
import type * as functions_push_send from "../functions/push/send.js";
import type * as functions_push_subscribe from "../functions/push/subscribe.js";
import type * as functions_push_unsubscribe from "../functions/push/unsubscribe.js";
import type * as functions_todos_access from "../functions/todos/access.js";
import type * as functions_todos_collaboration from "../functions/todos/collaboration.js";
import type * as functions_todos_createTodo from "../functions/todos/createTodo.js";
import type * as functions_todos_deleteTodo from "../functions/todos/deleteTodo.js";
import type * as functions_todos_getTodo from "../functions/todos/getTodo.js";
import type * as functions_todos_listTodosForUser from "../functions/todos/listTodosForUser.js";
import type * as functions_todos_toggle from "../functions/todos/toggle.js";
import type * as functions_todos_toggleMute from "../functions/todos/toggleMute.js";
import type * as functions_todos_updateTodo from "../functions/todos/updateTodo.js";
import type * as functions_users_getByEmail from "../functions/users/getByEmail.js";
import type * as functions_users_getProfile from "../functions/users/getProfile.js";
import type * as functions_users_getPublicProfile from "../functions/users/getPublicProfile.js";
import type * as functions_users_updateProfile from "../functions/users/updateProfile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  friends: typeof friends;
  "functions/auth/consumeAuthCode": typeof functions_auth_consumeAuthCode;
  "functions/auth/createAuthCode": typeof functions_auth_createAuthCode;
  "functions/auth/deleteExpiredCodes": typeof functions_auth_deleteExpiredCodes;
  "functions/auth/findOrCreateUser": typeof functions_auth_findOrCreateUser;
  "functions/auth/getLatestAuthCode": typeof functions_auth_getLatestAuthCode;
  "functions/auth/storeRefreshToken": typeof functions_auth_storeRefreshToken;
  "functions/auth/verifyRefreshToken": typeof functions_auth_verifyRefreshToken;
  "functions/push/deleteSubscription": typeof functions_push_deleteSubscription;
  "functions/push/isSubscribed": typeof functions_push_isSubscribed;
  "functions/push/listByUser": typeof functions_push_listByUser;
  "functions/push/listDueTodos": typeof functions_push_listDueTodos;
  "functions/push/markNotified": typeof functions_push_markNotified;
  "functions/push/processDue": typeof functions_push_processDue;
  "functions/push/send": typeof functions_push_send;
  "functions/push/subscribe": typeof functions_push_subscribe;
  "functions/push/unsubscribe": typeof functions_push_unsubscribe;
  "functions/todos/access": typeof functions_todos_access;
  "functions/todos/collaboration": typeof functions_todos_collaboration;
  "functions/todos/createTodo": typeof functions_todos_createTodo;
  "functions/todos/deleteTodo": typeof functions_todos_deleteTodo;
  "functions/todos/getTodo": typeof functions_todos_getTodo;
  "functions/todos/listTodosForUser": typeof functions_todos_listTodosForUser;
  "functions/todos/toggle": typeof functions_todos_toggle;
  "functions/todos/toggleMute": typeof functions_todos_toggleMute;
  "functions/todos/updateTodo": typeof functions_todos_updateTodo;
  "functions/users/getByEmail": typeof functions_users_getByEmail;
  "functions/users/getProfile": typeof functions_users_getProfile;
  "functions/users/getPublicProfile": typeof functions_users_getPublicProfile;
  "functions/users/updateProfile": typeof functions_users_updateProfile;
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
