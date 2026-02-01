import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Seo from "../../components/Seo";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import MotionFadeIn from "../../components/ui/MotionFadeIn";
import { verifyToken } from "../../lib/jwt";
import { getLatestAuthCodeExpiresAt, getUserByEmail } from "../../lib/storage";

type VerifyProps = {
  email: string;
  initialTimeLeft: number;
};

export default function Verify({ email, initialTimeLeft }: VerifyProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isResending, setIsResending] = useState(false);

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  const verify = async () => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.ok) router.push("/");
    else alert(data.error || "failed");
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (!email || timeLeft > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend code");
      setTimeLeft(60);
    } catch (error) {
      console.error((error as Error).message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <Seo
        title="Enter your code"
        description="Verify your sign-in code."
        noIndex
      />
      <MotionFadeIn className="w-full max-w-md">
        <Card className="p-6">
          <div className="mb-6">
            <p className="text-xs tracking-hero text-text-secondary">
              Almost there
            </p>
            <h1 className="text-h1 text-text-primary">Enter your code</h1>
            <p className="text-text-secondary mt-2">We sent it to {email}</p>
          </div>
          <div className="space-y-4">
            <input
              className={inputClass}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
            <Button className="w-full" onClick={verify}>
              Continue
            </Button>
          </div>
          <div className="mt-6 text-sm text-text-secondary">
            Need a new one?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0 || isResending || !email}
              className={
                timeLeft > 0 || isResending || !email
                  ? "text-text-secondary cursor-not-allowed"
                  : "text-primary cursor-pointer hover:underline"
              }
            >
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : "Send again"}
            </button>
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
  const email = context.query.email;
  if (typeof email !== "string" || !email) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const user = await getUserByEmail(email);
  const expiresAt = await getLatestAuthCodeExpiresAt(email);

  if (!user && !expiresAt) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const secondsSinceLastSend = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
    : 0;
  const initialTimeLeft = Math.max(0, secondsSinceLastSend);

  return {
    props: {
      isAuthenticated: false,
      email,
      initialTimeLeft,
    },
  };
};
