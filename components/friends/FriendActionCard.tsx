import { useMemo } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

type FriendUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  email?: string;
};

type FriendActionCardProps = {
  user: FriendUser;
  variant: "friend" | "request" | "search-result";
  requestStatus?: "pending" | "none";
  onAction?: (action: "remove" | "accept" | "decline" | "add") => void;
  isLoading?: boolean;
};

export default function FriendActionCard({
  user,
  variant,
  requestStatus = "none",
  onAction,
  isLoading = false,
}: FriendActionCardProps) {
  const initials = useMemo(() => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    const fallback = user.email?.[0] || "U";
    return (first + last || fallback).toUpperCase();
  }, [user.firstName, user.lastName, user.email]);

  const displayName = useMemo(() => {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || user.email || "User";
  }, [user.firstName, user.lastName, user.email]);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-surface-muted text-text-primary flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">
              {displayName}
            </div>
            <div className="text-xs text-text-secondary truncate">
              {user.username ? `@${user.username}` : "No username"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {variant === "friend" && (
            <Button
              variant="secondary"
              className="border-rose-200 text-rose-600 hover:text-rose-700"
              onClick={() => onAction?.("remove")}
              disabled={isLoading}
            >
              Remove
            </Button>
          )}
          {variant === "request" && (
            <>
              <Button
                variant="primary"
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => onAction?.("accept")}
                disabled={isLoading}
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                onClick={() => onAction?.("decline")}
                disabled={isLoading}
              >
                Decline
              </Button>
            </>
          )}
          {variant === "search-result" &&
            (requestStatus === "pending" ? (
              <Button
                variant="secondary"
                disabled
                className="text-text-secondary"
              >
                Request Sent
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => onAction?.("add")}
                disabled={isLoading}
              >
                Add friend
              </Button>
            ))}
        </div>
      </div>
    </Card>
  );
}
