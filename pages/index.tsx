import type { GetServerSideProps } from "next";
import CTA from "../components/landing/CTA";
import DashboardSummary from "../components/landing/DashboardSummary";
import FeatureGrid from "../components/landing/FeatureGrid";
import Footer from "../components/landing/Footer";
import Hero from "../components/landing/Hero";
import Preview from "../components/landing/Preview";
import Stats from "../components/landing/Stats";
import JsonLd from "../components/JsonLd";
import Seo from "../components/Seo";
import type { Doc } from "../convex/_generated/dataModel";
import { verifyToken } from "../lib/jwt";
import { listTodosForUser } from "../lib/storage";

type Todo = Doc<"todos">;

type HomeProps = {
  isAuthenticated: boolean;
  todos: Todo[];
  notifications: Todo[];
};

export default function Home({
  isAuthenticated,
  todos,
  notifications,
}: HomeProps) {
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completedAt).length;
  const pendingCount = totalCount - completedCount;
  const priorityCount = notifications.length;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Taskflow",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "A cozy daily planner for your tasks, notes, and gentle reminders.",
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={isAuthenticated ? "My day" : "Taskflow - Daily Planner"}
        description={
          isAuthenticated
            ? "See what's coming up and keep your day on track."
            : "A cozy daily planner for your tasks, notes, and gentle reminders."
        }
      />
      {!isAuthenticated && <JsonLd data={jsonLd} />}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
        {isAuthenticated ? (
          <DashboardSummary
            total={totalCount}
            pending={pendingCount}
            priority={priorityCount}
            completed={completedCount}
            priorityItems={notifications}
          />
        ) : (
          <>
            <Hero />
            <FeatureGrid />
            <Stats />
            <Preview />
            <CTA />
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context,
) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return {
      props: {
        isAuthenticated: false,
        todos: [],
        notifications: [],
      },
    };
  }

  const userId = payload.userId;
  const todos = await listTodosForUser(userId);
  const now = Date.now();
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  const notifications = todos.filter((t) => {
    if (t.completedAt || !t.expiresAt) return false;
    const expiresAt = new Date(t.expiresAt).getTime();
    return expiresAt - now >= 0 && expiresAt - now <= twoDaysMs;
  });

  return {
    props: {
      isAuthenticated: true,
      todos,
      notifications,
    },
  };
};
