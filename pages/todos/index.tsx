import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Seo from "../../components/Seo";
import ShareModal from "../../components/todos/ShareModal";
import TodoCard from "../../components/todos/TodoCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import MotionFadeIn from "../../components/ui/MotionFadeIn";
import PageHeader from "../../components/ui/PageHeader";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { verifyToken } from "../../lib/jwt";
import { listTodosForUser } from "../../lib/storage";

type Todo = Doc<"todos">;

type TodosProps = {
  todos: Todo[];
  notifications: Todo[];
  isAuthenticated: boolean;
  userId: string;
};

export default function TodosPage({
  todos: initialTodos,
  notifications: initialNotifications,
  userId,
}: TodosProps) {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [notifications, setNotifications] =
    useState<Todo[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "priority" | "completed"
  >("all");
  const [shareTaskId, setShareTaskId] = useState<string | null>(null);

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

  const toggleMute = async (todo: Todo) => {
    await apiFetch(`/api/todos/${String(todo._id)}/mute`, {
      method: "POST",
    });
    load();
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
      <Seo
        title="My day"
        description="Keep your tasks organized and your day feeling calm."
        noIndex
      />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <PageHeader title="My day" subtitle="Daily planner" />
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
                <TodoCard
                  key={String(t._id)}
                  todo={t}
                  isOwner={String(t.userId) === String(userId)}
                  isPriority={priorityIds.has(String(t._id))}
                  onToggleComplete={() => toggleComplete(t)}
                  onToggleMute={() => toggleMute(t)}
                  onRemove={() => remove(t)}
                  onShare={() => setShareTaskId(String(t._id))}
                />
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
      {shareTaskId && (
        <ShareModal
          taskId={shareTaskId as Id<"todos">}
          userId={userId as Id<"users">}
          isOpen={Boolean(shareTaskId)}
          onClose={() => setShareTaskId(null)}
        />
      )}
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
      userId,
    },
  };
};
