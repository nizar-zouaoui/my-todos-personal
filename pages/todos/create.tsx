import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Seo from "../../components/Seo";
import TodoForm, { TodoFormValues } from "../../components/todos/TodoForm";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { verifyToken } from "../../lib/jwt";

export default function CreateTodo() {
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
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) return;
      const data = await res.json();
      const id = data.todo?._id as string | undefined;
      if (id) {
        router.push(`/todos/task/${id}`);
      } else {
        router.push("/todos");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Add a task"
        description="Add a new task to your day."
        noIndex
      />
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <PageHeader
          title="Add a task"
          subtitle="New"
          actions={
            <>
              <Button href="/todos" variant="primary">
                Back to tasks
              </Button>
            </>
          }
        />
        <TodoForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: { isAuthenticated: true } };
};
