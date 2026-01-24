import { differenceInDays, formatDistanceToNow, parseISO } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Todo = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  expiresAt?: string | null;
  completedAt?: string | null;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const load = async () => {
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        expiresAt: expiresAt || null,
      }),
    });
    setTitle("");
    setDescription("");
    setExpiresAt("");
    load();
  };

  const notifications = todos.filter(
    (t) =>
      !t.completedAt &&
      t.expiresAt &&
      differenceInDays(parseISO(t.expiresAt), new Date()) <= 2,
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <nav>
            <Link href="/login" className="text-blue-600">
              Sign in
            </Link>
          </nav>
        </header>

        <section className="mb-6">
          <h2 className="font-semibold">Create task</h2>
          <input
            className="w-full border p-2 rounded mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            className="w-full border p-2 rounded mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (Markdown)"
          />
          <input
            className="w-full border p-2 rounded mt-2"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <button
            className="mt-2 bg-green-600 text-white p-2 rounded"
            onClick={create}
          >
            Create
          </button>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold">
            Notifications ({notifications.length})
          </h2>
          <ul className="mt-2">
            {notifications.map((n) => (
              <li key={n.id} className="p-2 border rounded mb-2 bg-yellow-50">
                <div className="flex justify-between">
                  <strong>{n.title}</strong>
                  <span className="text-sm text-gray-600">
                    Expires {formatDistanceToNow(parseISO(n.expiresAt!))}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {n.description || ""}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">All tasks</h2>
          <ul className="mt-2">
            {todos.map((t) => (
              <li key={t.id} className="p-3 border rounded mb-2 bg-white">
                <div className="flex justify-between">
                  <div>
                    <strong>{t.title}</strong>
                    <div className="text-sm text-gray-600">
                      Created {formatDistanceToNow(new Date(t.createdAt))} ago
                    </div>
                  </div>
                  <div>
                    {t.expiresAt && (
                      <div className="text-sm text-red-600">
                        Expires {formatDistanceToNow(new Date(t.expiresAt))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {t.description || ""}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
