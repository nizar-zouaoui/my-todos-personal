import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Bold, Code, Italic, List, ListTodo } from "lucide-react";
import { z } from "zod";
import type { Doc } from "../../convex/_generated/dataModel";
import Button from "../ui/Button";
import Card from "../ui/Card";
import MotionFadeIn from "../ui/MotionFadeIn";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type TodoFormValues = z.infer<typeof todoSchema>;

type TodoFormProps = {
  initialValues?: Partial<Doc<"todos">>;
  onSubmit: (values: TodoFormValues) => Promise<void>;
  isSubmitting: boolean;
  mode: "create" | "edit";
};

const toLocalInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const dt = new Date(iso);
  const offset = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function TodoForm({
  initialValues,
  onSubmit,
  isSubmitting,
  mode,
}: TodoFormProps) {
  const defaultValues = useMemo(() => {
    return {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      expiresAt: toLocalInputValue(initialValues?.expiresAt),
    };
  }, [initialValues]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues,
  });

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionValue = watch("description") || "";
  const descriptionRegister = register("description");

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";
  const editorInputClass =
    "w-full bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 border-0 rounded-none";
  const tabBaseClass =
    "px-3 py-2 text-sm font-medium transition-soft border-b-2";

  const handleFormat = (prefix: string, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const value = textarea.value || "";
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selection = value.slice(start, end);
    const after = value.slice(end);
    const nextValue = `${before}${prefix}${selection}${suffix}${after}`;

    setValue("description", nextValue, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const cursorStart = start + prefix.length;
    const cursorEnd = cursorStart + selection.length;

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const payload: TodoFormValues = {
      title: values.title,
      description: values.description?.trim() || undefined,
      expiresAt: values.expiresAt
        ? new Date(values.expiresAt).toISOString()
        : undefined,
    };
    await onSubmit(payload);
  });

  return (
    <MotionFadeIn className="space-y-6">
      <Card className="p-5">
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <input
              className={inputClass}
              placeholder="Title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-warning mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <div className="border border-border rounded-md overflow-hidden bg-surface">
              <div className="flex items-center border-b border-border bg-surface">
                <button
                  type="button"
                  className={`${tabBaseClass} ${
                    activeTab === "write"
                      ? "text-text-primary bg-background border-primary"
                      : "text-text-secondary border-transparent"
                  }`}
                  onClick={() => setActiveTab("write")}
                >
                  Write
                </button>
                <button
                  type="button"
                  className={`${tabBaseClass} ${
                    activeTab === "preview"
                      ? "text-text-primary bg-background border-primary"
                      : "text-text-secondary border-transparent"
                  }`}
                  onClick={() => setActiveTab("preview")}
                >
                  Preview
                </button>
              </div>

              {activeTab === "write" && (
                <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-2">
                  <button
                    type="button"
                    className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-soft"
                    onClick={() => handleFormat("**", "**")}
                    aria-label="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-soft"
                    onClick={() => handleFormat("_", "_")}
                    aria-label="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-soft"
                    onClick={() => handleFormat("- ")}
                    aria-label="List"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-soft"
                    onClick={() => handleFormat("- [ ] ")}
                    aria-label="Task list"
                  >
                    <ListTodo className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-soft"
                    onClick={() => handleFormat("```\n", "\n```")}
                    aria-label="Code block"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                </div>
              )}

              <textarea
                className={editorInputClass}
                placeholder="Description (Markdown)"
                rows={6}
                style={{ display: activeTab === "write" ? "block" : "none" }}
                {...descriptionRegister}
                ref={(element) => {
                  descriptionRegister.ref(element);
                  textareaRef.current = element;
                }}
              />

              {activeTab === "preview" && (
                <div className="px-3 py-2 min-h-[152px] prose prose-invert prose-sm max-w-none">
                  {descriptionValue.trim().length > 0 ? (
                    <ReactMarkdown>{descriptionValue}</ReactMarkdown>
                  ) : (
                    <p className="text-text-secondary">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
            {errors.description && (
              <p className="text-sm text-warning mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <input
              className={inputClass}
              type="datetime-local"
              {...register("expiresAt")}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
            <Button href="/todos" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </MotionFadeIn>
  );
}
