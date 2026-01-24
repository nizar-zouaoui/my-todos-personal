import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

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
    <div className="min-h-screen bg-blend-darken flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Sign in</h1>
        <input
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          onClick={send}
        >
          Send code
        </button>
        {sent && (
          <p className="mt-3 text-sm text-green-600">
            Code sent — check your email.
          </p>
        )}
      </div>
    </div>
  );
}
