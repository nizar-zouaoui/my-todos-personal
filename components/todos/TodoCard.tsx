import { useQuery } from "convex/react";
import { Bell, BellOff, Check, MoreVertical, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import Card from "../ui/Card";
import StatusPill from "../ui/StatusPill";

type Todo = Doc<"todos">;

type TodoCardProps = {
  todo: Todo;
  isOwner: boolean;
  isPriority: boolean;
  onToggleComplete: () => void;
  onToggleMute: () => void;
  onRemove: () => void;
  onShare: () => void;
};

const getDisplayName = (user?: {
  firstName?: string;
  lastName?: string;
  username?: string;
}) => {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || user?.username || "User";
};

export default function TodoCard({
  todo,
  isOwner,
  isPriority,
  onToggleComplete,
  onToggleMute,
  onRemove,
  onShare,
}: TodoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const completedBy = useQuery(
    api.functions.users.getPublicProfile.getPublicProfile,
    todo.completedBy ? { userId: String(todo.completedBy) } : "skip",
  );

  const collaborators = useQuery(
    api.functions.todos.collaboration.listCollaborators,
    { taskId: todo._id as Id<"todos"> },
  ) as
    | {
        _id: Id<"users">;
        firstName?: string;
        lastName?: string;
        username?: string;
        avatarUrl?: string;
        email?: string;
      }[]
    | undefined;

  const facepile = useMemo(() => {
    const list = collaborators || [];
    return {
      avatars: list.slice(0, 3),
      extra: list.length > 3 ? list.length - 3 : 0,
    };
  }, [collaborators]);

  return (
    <Card className="group relative p-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border transition-soft ${
            todo.completedAt
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-border text-text-secondary"
          }`}
          aria-label={todo.completedAt ? "Completed" : "Mark complete"}
          disabled={Boolean(todo.completedAt)}
        >
          {todo.completedAt && <Check className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/todos/task/${String(todo._id)}`}
                className="block truncate font-semibold text-text-primary"
              >
                {todo.title}
              </Link>
              <div className="text-xs text-text-secondary">
                Added {new Date(todo.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-start gap-1 shrink-0">
              <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-soft">
                {isOwner && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-border px-2 py-2 text-text-primary"
                    onClick={onShare}
                    aria-label="Share task"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                )}
                {!todo.completedAt && todo.expiresAt && (
                  <button
                    className={`inline-flex items-center justify-center rounded-full border border-border px-2 py-2 text-sm transition-soft ${
                      todo.isMuted
                        ? "text-text-secondary opacity-60"
                        : "text-text-primary"
                    }`}
                    onClick={onToggleMute}
                    aria-label={
                      todo.isMuted ? "Resume reminders" : "Pause reminders"
                    }
                    type="button"
                  >
                    {todo.isMuted ? (
                      <BellOff className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl border border-border bg-surface shadow-card z-10">
                    {isOwner && (
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-muted"
                        onClick={() => {
                          setMenuOpen(false);
                          onShare();
                        }}
                      >
                        Share
                      </button>
                    )}
                    {!todo.completedAt && todo.expiresAt && (
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-muted"
                        onClick={() => {
                          setMenuOpen(false);
                          onToggleMute();
                        }}
                      >
                        {todo.isMuted ? "Resume reminders" : "Pause reminders"}
                      </button>
                    )}
                    <Link
                      href={`/todos/edit/${String(todo._id)}`}
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-surface-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      Edit
                    </Link>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-surface-muted"
                      onClick={() => {
                        setMenuOpen(false);
                        onRemove();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {todo.description && (
            <div className="mt-2 line-clamp-2 text-sm text-text-secondary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ node, ordered, ...props }) => (
                    <ul className="list-disc list-inside" {...props} />
                  ),
                  ol: ({ node, ordered, ...props }) => (
                    <ol className="list-decimal list-inside" {...props} />
                  ),
                  li: ({ node, ordered, ...props }) => (
                    <li className="my-1" {...props} />
                  ),
                }}
              >
                {todo.description}
              </ReactMarkdown>
            </div>
          )}

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {todo.completedAt && (
                  <StatusPill label="Done" variant="success" />
                )}
                {!todo.completedAt && isPriority && (
                  <StatusPill label="Do soon" variant="warning" />
                )}
                {todo.expiresAt && (
                  <span className="text-xs text-warning">
                    Due {new Date(todo.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {todo.completedAt && completedBy && (
                <div className="text-xs text-text-secondary">
                  ✓ Completed by {getDisplayName(completedBy)}
                </div>
              )}
            </div>

            {facepile.avatars.length > 0 && (
              <div className="flex items-center">
                {facepile.avatars.map((user, index) => (
                  <div
                    key={String(user._id)}
                    className="h-7 w-7 rounded-full border border-background bg-surface-muted overflow-hidden"
                    style={{ marginLeft: index === 0 ? 0 : -6 }}
                    title={getDisplayName(user)}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full text-[10px] text-text-primary flex items-center justify-center font-semibold">
                        {(
                          user.firstName?.[0] ||
                          user.username?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {facepile.extra > 0 && (
                  <div className="h-7 w-7 rounded-full border border-background bg-surface-muted text-[10px] text-text-secondary flex items-center justify-center font-semibold -ml-1">
                    +{facepile.extra}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
