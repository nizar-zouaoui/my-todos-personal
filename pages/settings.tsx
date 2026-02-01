import type { GetServerSideProps } from "next";
import Seo from "../components/Seo";
import NotificationSettings from "../components/push/NotificationSettings";
import PageHeader from "../components/ui/PageHeader";
import { verifyToken } from "../lib/jwt";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Settings"
        description="Manage your notification preferences."
        noIndex
      />
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <PageHeader title="Settings" subtitle="Preferences" />
        <NotificationSettings />
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
