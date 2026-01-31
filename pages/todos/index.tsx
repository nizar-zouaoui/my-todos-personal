import { formatDistanceToNow } from "date-fns";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import MotionFadeIn from "../../components/ui/MotionFadeIn";
import StatusPill from "../../components/ui/StatusPill";
import type { Doc } from "../../convex/_generated/dataModel";
import { verifyToken } from "../../lib/jwt";
import { listTodosForUser } from "../../lib/storage";

type Todo = Doc<"todos">;

type TodosProps = {
  todos: Todo[];
  notifications: Todo[];
  isAuthenticated: boolean;
};

export default function TodosPage({
  todos: initialTodos,
  notifications: initialNotifications,
}: TodosProps) {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [notifications, setNotifications] =
    useState<Todo[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "priority" | "completed"
  >("all");

  const apiFetch = async (input: RequestInfo, init?: RequestInit) => {
    const res = await fetch(input, init);
    if (res.status !== 401) return res;
    const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
    if (!refreshed.ok) {
      router.push("/login");
      return res;
    }
    return fetch(input, init);
  };

  const load = async () => {
    const [todosRes, notificationsRes] = await Promise.all([
      apiFetch("/api/todos"),
      apiFetch("/api/todos/notifications"),
    ]);
    if (todosRes.ok) {
      const data = await todosRes.json();
      setTodos(data.todos);
    }
    if (notificationsRes.ok) {
      const data = await notificationsRes.json();
      setNotifications(data.todos || []);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    if (todo.completedAt) return;
    const completedAt = new Date().toISOString();
    await apiFetch(`/api/todos/${String(todo._id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt }),
    });
    load();
  };

  const remove = async (todo: Todo) => {
    await apiFetch(`/api/todos/${String(todo._id)}`, { method: "DELETE" });
    load();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const priorityIds = new Set(notifications.map((n) => String(n._id)));
  const filteredTodos = todos.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !t.completedAt;
    if (activeTab === "completed") return Boolean(t.completedAt);
    return !t.completedAt && priorityIds.has(String(t._id));
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-end pb-6">
          <Button href="/todos/create" variant="primary">
            Add task
          </Button>
        </div>
        <MotionFadeIn className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(
                [
                  { id: "all", label: "All tasks" },
                  { id: "pending", label: "In progress" },
                  { id: "priority", label: "Do soon" },
                  { id: "completed", label: "Done" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  className={
                    activeTab === tab.id
                      ? "px-3 py-1 rounded-md bg-primary text-background transition-soft"
                      : "px-3 py-1 rounded-md border border-border text-text-secondary transition-soft"
                  }
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.id === "priority" && (
                    <span className="ml-2 text-xs text-text-secondary">
                      {notifications.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              {filteredTodos.map((t) => (
                <Card key={String(t._id)} className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div>
                      <Link
                        href={`/todos/task/${String(t._id)}`}
                        className="font-semibold"
                      >
                        {t.title}
                      </Link>
                      <div className="text-sm text-text-secondary">
                        Added {formatDistanceToNow(new Date(t.createdAt))} ago
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {t.completedAt && (
                          <StatusPill label="Done" variant="success" />
                        )}
                        {!t.completedAt && priorityIds.has(String(t._id)) && (
                          <StatusPill label="Do soon" variant="warning" />
                        )}
                      </div>
                    </div>
                    <div>
                      {t.expiresAt && (
                        <div className="text-sm text-warning">
                          Do by {formatDistanceToNow(new Date(t.expiresAt))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-text-secondary">
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
                      {t.description || ""}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-3 text-sm">
                    {!t.completedAt && (
                      <Button
                        variant="secondary"
                        onClick={() => toggleComplete(t)}
                      >
                        Mark done
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      className="text-warning"
                      onClick={() => remove(t)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredTodos.length === 0 && (
                <li>
                  <EmptyState
                    title="All caught up!"
                    body="Ready to add your first task?"
                    actionLabel="Add a task"
                    actionHref="/todos/create"
                  />
                </li>
              )}
            </ul>
          </Card>
        </MotionFadeIn>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<TodosProps> = async (
  context,
) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const userId = payload.userId;
  const todos = await listTodosForUser(userId);
  const now = Date.now();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  const notifications = todos.filter((t) => {
    if (t.completedAt || !t.expiresAt) return false;
    const expiresAt = new Date(t.expiresAt).getTime();
    return expiresAt - now >= 0 && expiresAt - now <= twoDaysMs;
  });

  return {
    props: {
      todos,
      notifications,
      isAuthenticated: true,
    },
  };
};
