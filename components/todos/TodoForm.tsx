import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
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
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues,
  });

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

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
            <textarea
              className={inputClass}
              placeholder="Description (Markdown)"
              rows={6}
              {...register("description")}
            />
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
