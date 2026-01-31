import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "./Button";

type NavbarProps = {
  isAuthenticated: boolean;
};

export default function Navbar({ isAuthenticated }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-background grid place-items-center font-semibold shadow-card">
              T
            </div>
            <div>
              <p className="text-xs tracking-hero text-text-secondary">
                My Todos Personal
              </p>
              <span className="text-sm text-text-primary">
                Plan your day, your way.
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Button href="/" variant="subtle">
              Home
            </Button>
            {isAuthenticated ? (
              <>
                <Button href="/todos" variant="subtle">
                  My tasks
                </Button>
                <Button variant="subtle" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button href="/login" variant="primary">
                Sign in
              </Button>
            )}
          </div>

          <button
            className="md:hidden rounded-xl border border-border px-3 py-2 text-sm text-text-secondary transition-soft"
            onClick={() => setOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-[72px] z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 border-b border-border bg-background shadow-md">
            <div className="px-6 py-4 flex flex-col gap-3">
              <Link
                href="/"
                className="text-text-primary"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/todos"
                    className="text-text-primary"
                    onClick={() => setOpen(false)}
                  >
                    My tasks
                  </Link>
                  <button
                    className="text-text-secondary text-left"
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-text-primary"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
