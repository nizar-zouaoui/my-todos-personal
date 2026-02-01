import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Button from "../ui/Button";
import Card from "../ui/Card";

type ShareModalProps = {
  taskId: Id<"todos">;
  isOpen: boolean;
  onClose: () => void;
  userId: Id<"users">;
};

type Friend = {
  _id: Id<"users">;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  email?: string;
};

export default function ShareModal({
  taskId,
  isOpen,
  onClose,
  userId,
}: ShareModalProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const friends = useQuery(
    api.friends.listFriends,
    isOpen ? { userId } : "skip",
  ) as Friend[] | undefined;
  const collaborators = useQuery(
    api.functions.todos.collaboration.listCollaborators,
    isOpen ? { taskId } : "skip",
  ) as Friend[] | undefined;

  const addCollaborator = useMutation(
    api.functions.todos.collaboration.addCollaborator,
  );
  const removeCollaborator = useMutation(
    api.functions.todos.collaboration.removeCollaborator,
  );

  const collaboratorSet = useMemo(() => {
    if (!collaborators) return new Set<string>();
    return new Set(collaborators.map((c) => String(c._id)));
  }, [collaborators]);

  if (!isOpen) return null;

  const handleAdd = async (friendId: Id<"users">) => {
    setLoading((prev) => ({ ...prev, [friendId]: true }));
    try {
      await addCollaborator({ taskId, friendId, userId });
    } finally {
      setLoading((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const handleRemove = async (friendId: Id<"users">) => {
    setLoading((prev) => ({ ...prev, [friendId]: true }));
    try {
      await removeCollaborator({ taskId, friendId, userId });
    } finally {
      setLoading((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-h2 text-text-primary">Share Task</h2>
            <p className="text-sm text-text-secondary">
              Invite friends to collaborate on this task.
            </p>
          </div>
          <Button variant="subtle" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {(friends || []).length === 0 && (
            <div className="text-sm text-text-secondary">
              No friends available yet.
            </div>
          )}
          {(friends || []).map((friend) => {
            const isCollaborator = collaboratorSet.has(String(friend._id));
            return (
              <div
                key={String(friend._id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt="Avatar"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-surface-muted text-text-primary flex items-center justify-center text-xs font-semibold">
                      {(
                        friend.firstName?.[0] ||
                        friend.email?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {`${friend.firstName || ""} ${friend.lastName || ""}`.trim() ||
                        friend.email ||
                        "Friend"}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {friend.username ? `@${friend.username}` : "No username"}
                    </div>
                  </div>
                </div>
                {isCollaborator ? (
                  <Button
                    variant="secondary"
                    className="border-rose-200 text-rose-600 hover:text-rose-700"
                    disabled={Boolean(loading[friend._id])}
                    onClick={() => handleRemove(friend._id)}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={Boolean(loading[friend._id])}
                    onClick={() => handleAdd(friend._id)}
                  >
                    Invite
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
