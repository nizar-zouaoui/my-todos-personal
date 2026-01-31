import type { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  if (notFound || !todo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <EmptyState
            title="Task not found"
            body="We couldn't find that task. Return to your dashboard and pick another."
            actionLabel="Back to todos"
            actionHref="/todos"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <MotionFadeIn className="space-y-6">
          <PageHeader
            title={todo.title}
            subtitle="Task"
            actions={
              <>
                <Button href="/todos" variant="secondary">
                  Back
                </Button>
                <Button
                  href={`/todos/edit/${String(todo._id)}`}
                  variant="primary"
                >
                  Edit
                </Button>
              </>
            }
          />

          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span>Created {new Date(todo.createdAt).toLocaleString()}</span>
              {todo.expiresAt && (
                <span className="text-warning">
                  Expires {new Date(todo.expiresAt).toLocaleString()}
                </span>
              )}
              {todo.completedAt && (
                <StatusPill label="Completed" variant="success" />
              )}
              {!todo.completedAt && todo.expiresAt && (
                <StatusPill label="Pending" variant="warning" />
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h2 text-text-primary">Description</h2>
            <div className="mt-3 text-text-secondary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-1" {...props} />
                  ),
                }}
              >
                {todo.description || "No description provided."}
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
