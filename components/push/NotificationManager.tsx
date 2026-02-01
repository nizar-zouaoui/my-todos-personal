import { useEffect, useState } from "react";
import Button from "../ui/Button";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function NotificationManager() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "unsupported" | "denied" | "enabled" | "error"
  >("idle");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
    if (!supported) {
      setStatus("unsupported");
    }
  }, []);

  if (!isMounted) return null;

  const enable = async () => {
    if (!isSupported) {
      setStatus("unsupported");
      return;
    }

    setIsWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        const readyRegistration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Service worker not ready within 5s")),
              5000,
            ),
          ),
        ]);
        registration = readyRegistration as ServiceWorkerRegistration;
      }
      if (!registration) {
        throw new Error("Service worker registration not found");
      }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Missing public key");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error("Failed to save subscription");
      setStatus("enabled");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setStatus("error");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">
          Task reminders
        </h3>
        <p className="text-sm text-text-secondary">
          Get a gentle nudge when tasks are due.
        </p>
      </div>
      {!isSupported && (
        <p className="text-sm text-text-secondary">
          Notifications aren’t supported on this device.
        </p>
      )}
      {status === "denied" && (
        <p className="text-sm text-warning">
          Notifications are blocked in your browser settings.
        </p>
      )}
      {status === "enabled" && (
        <p className="text-sm text-success">Reminders are enabled.</p>
      )}
      <Button onClick={enable} disabled={isWorking || status === "enabled"}>
        {status === "enabled" ? "Reminders enabled" : "Enable reminders"}
      </Button>
    </div>
  );
}
