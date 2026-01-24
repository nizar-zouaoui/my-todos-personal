import { useRouter } from "next/router";
import { useState } from "react";

export default function Verify() {
  const router = useRouter();
  const email = (router.query.email as string) || "";
  const [code, setCode] = useState("");

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Enter code</h1>
        <p className="text-sm mb-2">Sent to {email}</p>
        <input
          className="w-full border p-2 rounded mb-3"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          onClick={verify}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
