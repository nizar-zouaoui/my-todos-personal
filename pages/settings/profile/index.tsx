import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Seo from "../../../components/Seo";
import { type ProfileData } from "../../../components/settings/ProfileCard";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import { verifyToken } from "../../../lib/jwt";
import { getUserById } from "../../../lib/storage";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  birthday: string;
};

const toDateInput = (ts?: number) => {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toISOString().slice(0, 10);
};

type ProfilePageProps = {
  initialProfile: ProfileData | null;
};

export default function ProfileSettings({
  initialProfile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const defaultValues = useMemo(
    () => ({
      firstName: initialProfile?.firstName ?? "",
      lastName: initialProfile?.lastName ?? "",
      username: initialProfile?.username ?? "",
      birthday: initialProfile?.birthday
        ? toDateInput(initialProfile.birthday)
        : "",
    }),
    [initialProfile],
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
  } = useForm<ProfileFormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const firstName = watch("firstName")?.trim() ?? "";
  const lastName = watch("lastName")?.trim() ?? "";
  const username = watch("username")?.trim() ?? "";

  const displayName = useMemo(() => {
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return initialProfile?.email || "Your profile";
  }, [firstName, lastName, initialProfile?.email]);

  const initials = useMemo(() => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    const fallback = initialProfile?.email?.[0] || "U";
    return (first + last || fallback).toUpperCase();
  }, [firstName, lastName, initialProfile?.email]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName?.trim() || undefined,
          lastName: values.lastName?.trim() || undefined,
          username: values.username?.trim() || undefined,
          birthday: values.birthday
            ? new Date(values.birthday).getTime()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      const user = data.user || {};
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        birthday: user.birthday ? toDateInput(user.birthday) : "",
      });
      setToast({ type: "success", message: "Profile saved." });
    } catch (error) {
      setToast({
        type: "error",
        message: (error as Error).message || "Failed to save profile",
      });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Profile" description="Manage your profile." noIndex />
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <PageHeader title="Profile" subtitle="Your details" />
        <Card className="p-6 space-y-6">
          {toast && (
            <div
              role="status"
              aria-live="polite"
              className={`fixed right-6 top-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                toast.type === "success"
                  ? "border-emerald-200 text-emerald-600 bg-surface"
                  : "border-rose-200 text-rose-600 bg-surface"
              }`}
            >
              {toast.message}
            </div>
          )}
          <div className="flex items-center gap-4">
            {initialProfile?.avatarUrl ? (
              <img
                src={initialProfile.avatarUrl}
                alt="Profile avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-surface-muted text-text-primary flex items-center justify-center font-semibold">
                {initials}
              </div>
            )}
            <div>
              <div className="text-lg font-semibold text-text-primary">
                {displayName}
              </div>
              <div className="text-sm text-text-secondary">
                {username ? `@${username}` : "Add a username"}
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-text-secondary">First name</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary"
                {...register("firstName")}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Last name</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary"
                {...register("lastName")}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Username</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary"
                placeholder="johnny"
                {...register("username")}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Birthday</label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text-primary"
                {...register("birthday")}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  context,
) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const user = await getUserById(payload.userId);

  const initialProfile = user
    ? {
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        username: user.username || null,
        avatarUrl: user.avatarUrl || null,
        birthday: user.birthday || null,
        email: user.email || null,
      }
    : null;

  return { props: { initialProfile } };
};
