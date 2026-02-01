import { useMemo } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

export type ProfileData = {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  birthday?: number;
  email?: string;
};

type ProfileCardProps = {
  initialData: ProfileData | null;
};

export default function ProfileCard({ initialData }: ProfileCardProps) {
  const firstName = initialData?.firstName?.trim() ?? "";
  const lastName = initialData?.lastName?.trim() ?? "";
  const username = initialData?.username?.trim() ?? "";

  const displayName = useMemo(() => {
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return initialData?.email || "Your profile";
  }, [firstName, lastName, initialData?.email]);

  const initials = useMemo(() => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    const fallback = initialData?.email?.[0] || "U";
    return (first + last || fallback).toUpperCase();
  }, [firstName, lastName, initialData?.email]);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-h2 text-text-primary">Profile</h2>
          <p className="text-sm text-text-secondary">
            Manage your public identity.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {initialData?.avatarUrl ? (
              <img
                src={initialData.avatarUrl}
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
          <Button href="/settings/profile" variant="secondary">
            Edit profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
