import { Bell, BellOff } from "lucide-react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Seo from "../../../components/Seo";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import MotionFadeIn from "../../../components/ui/MotionFadeIn";
import PageHeader from "../../../components/ui/PageHeader";
import StatusPill from "../../../components/ui/StatusPill";
import type { Doc } from "../../../convex/_generated/dataModel";
import { verifyToken } from "../../../lib/jwt";
import { getTodo } from "../../../lib/storage";

type Todo = Doc<"todos">;

type TaskViewProps = {
  todo: Todo | null;
  isAuthenticated: boolean;
  notFound: boolean;
};

export default function TaskView({ todo, notFound }: TaskViewProps) {
  const router = useRouter();
  const [currentTodo, setCurrentTodo] = useState(todo);
  const [isToggling, setIsToggling] = useState(false);
  if (notFound || !currentTodo) {
    return (
      <div className="min-h-screen bg-background">
        <Seo
          title="Task not found"
          description="We couldn't find that task."
          noIndex
        />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <EmptyState
            title="We couldn't find that task"
            body="Let's head back and pick another one."
            actionLabel="Back to tasks"
            actionHref="/todos"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={currentTodo.title}
        description={currentTodo.description || "A task in your daily planner."}
        noIndex
      />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <MotionFadeIn className="space-y-6">
          <PageHeader
            title={currentTodo.title}
            subtitle="My tasks"
            actions={
              <>
                <Button href="/todos" variant="secondary">
                  Back to tasks
                </Button>
                <Button href="/todos/create" variant="secondary">
                  Add task
                </Button>
                <Button
                  href={`/todos/edit/${String(currentTodo._id)}`}
                  variant="primary"
                >
                  Edit task
                </Button>
              </>
            }
          />

          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span>
                Added {new Date(currentTodo.createdAt).toLocaleString()}
              </span>
              {currentTodo.expiresAt && (
                <span className="text-warning">
                  Do by {new Date(currentTodo.expiresAt).toLocaleString()}
                </span>
              )}
              {currentTodo.completedAt && (
                <StatusPill label="Done" variant="success" />
              )}
              {!currentTodo.completedAt && currentTodo.expiresAt && (
                <StatusPill label="In progress" variant="warning" />
              )}
              {!currentTodo.completedAt && currentTodo.expiresAt && (
                <button
                  className={`inline-flex items-center justify-center rounded-full border border-border px-3 py-2 text-sm transition-soft ${
                    currentTodo.isMuted
                      ? "text-text-secondary opacity-60"
                      : "text-text-primary"
                  }`}
                  type="button"
                  disabled={isToggling}
                  onClick={async () => {
                    setIsToggling(true);
                    try {
                      const res = await fetch(
                        `/api/todos/${String(currentTodo._id)}/mute`,
                        { method: "POST" },
                      );
                      if (res.ok) {
                        const data = await res.json();
                        setCurrentTodo(data.todo);
                      } else if (res.status === 401) {
                        router.push("/login");
                      }
                    } finally {
                      setIsToggling(false);
                    }
                  }}
                  aria-label={
                    currentTodo.isMuted ? "Resume reminders" : "Pause reminders"
                  }
                >
                  {currentTodo.isMuted ? (
                    <BellOff className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h2 text-text-primary">Notes</h2>
            <div className="mt-3 text-text-secondary">
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
                {currentTodo.description || "No notes yet."}
              </ReactMarkdown>
            </div>
          </Card>
        </MotionFadeIn>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<TaskViewProps> = async (
  context,
) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const id = context.params?.id as string | undefined;
  if (!id) {
    return {
      props: { todo: null, isAuthenticated: true, notFound: true },
    };
  }

  const todo = await getTodo(id, payload.userId);
  if (!todo) {
    return {
      props: { todo: null, isAuthenticated: true, notFound: true },
    };
  }

  return {
    props: { todo, isAuthenticated: true, notFound: false },
  };
};
