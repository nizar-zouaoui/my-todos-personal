import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

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

export default function NotificationSettings() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    if (!isMounted || !isSupported) return;
    const load = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      setIsEnabled(Boolean(subscription));
    };
    load();
  }, [isMounted, isSupported]);

  if (!isMounted) return null;

  const enable = async () => {
    if (!isSupported) return;
    setIsWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.ready;
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

      setIsEnabled(true);
    } finally {
      setIsWorking(false);
    }
  };

  const disable = async () => {
    if (!isSupported) return;
    setIsWorking(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      setIsEnabled(false);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-h2 text-text-primary">
            Notification Preferences
          </h2>
          <p className="text-sm text-text-secondary">
            Turn reminders on or off for this device.
          </p>
        </div>
        {!isSupported && (
          <p className="text-sm text-warning">
            Notifications aren’t supported on this device.
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-text-secondary">
            {isEnabled ? "Reminders enabled" : "Reminders disabled"}
          </div>
          {isEnabled ? (
            <Button onClick={disable} disabled={isWorking} variant="secondary">
              Turn off
            </Button>
          ) : (
            <Button onClick={enable} disabled={isWorking} variant="primary">
              Turn on
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
