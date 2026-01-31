import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import TodoForm, { TodoFormValues } from "../../../components/todos/TodoForm";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import type { Doc } from "../../../convex/_generated/dataModel";
import { verifyToken } from "../../../lib/jwt";
import { getTodo } from "../../../lib/storage";

type Todo = Doc<"todos">;

type EditPageProps = {
  todo: Todo | null;
  isAuthenticated: boolean;
  notFound: boolean;
};

export default function EditTodo({ todo, notFound }: EditPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (values: TodoFormValues) => {
    if (!todo) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/todos/${String(todo._id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) return;
      router.push(`/todos/task/${String(todo._id)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (notFound) {
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

  if (!todo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="rounded-lg border border-border bg-surface-muted p-6 text-text-secondary">
            Loading task...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <PageHeader title="Edit task" subtitle="Task" />
        <TodoForm
          mode="edit"
          initialValues={todo}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<EditPageProps> = async (
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
