import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Seo from "../../components/Seo";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import MotionFadeIn from "../../components/ui/MotionFadeIn";
import { verifyToken } from "../../lib/jwt";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  const send = async () => {
    await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    router.push({ pathname: "/verify", query: { email } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <Seo
        title="Sign in"
        description="Sign in to your daily planner."
        noIndex
      />
      <MotionFadeIn className="w-full max-w-md">
        <Card className="p-6">
          <div className="mb-6">
            <p className="text-xs tracking-hero text-text-secondary">
              Welcome to My Todos Personal
            </p>
            <h1 className="text-h1 text-text-primary">Sign in to your day</h1>
            <p className="text-text-secondary mt-2">
              We'll email you a 6-digit code to get you started.
            </p>
          </div>
          <div className="space-y-4">
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
            />
            <Button className="w-full" onClick={send}>
              Send my code
            </Button>
            {sent && (
              <p className="text-sm text-success">
                All set — check your inbox.
              </p>
            )}
          </div>
          <div className="mt-6 text-sm text-text-secondary">
            New here?{" "}
            <Link href="/" className="text-text-primary">
              Take a quick tour
            </Link>
          </div>
        </Card>
      </MotionFadeIn>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (payload) {
    return {
      redirect: { destination: "/todos", permanent: false },
    };
  }

  return { props: { isAuthenticated: false } };
};
