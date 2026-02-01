import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import NotificationSettings from "../../components/push/NotificationSettings";
import Seo from "../../components/Seo";
import ProfileCard, {
  type ProfileData,
} from "../../components/settings/ProfileCard";
import PageHeader from "../../components/ui/PageHeader";
import { verifyToken } from "../../lib/jwt";
import { getUserById } from "../../lib/storage";

type SettingsPageProps = {
  initialProfile: ProfileData | null;
};

export default function SettingsPage({
  initialProfile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Settings"
        description="Manage your notification preferences."
        noIndex
      />
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <PageHeader title="Settings" subtitle="Preferences" />
        <ProfileCard initialData={initialProfile} />
        <NotificationSettings />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<SettingsPageProps> = async (
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
