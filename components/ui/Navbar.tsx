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
    <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-background grid place-items-center font-semibold shadow-card">
            T
          </div>
          <div>
            <p className="text-xs uppercase tracking-hero text-text-secondary">
              Taskflow
            </p>
            <span className="text-sm text-text-primary">Calm productivity</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button href="/" variant="secondary">
            Home
          </Button>
          {isAuthenticated ? (
            <>
              <Button href="/todos" variant="secondary">
                Todos
              </Button>
              <Button href="/todos/create" variant="secondary">
                Create
              </Button>
              <Button variant="subtle" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button href="/login" variant="primary">
              Login
            </Button>
          )}
        </div>

        <button
          className="md:hidden rounded-md border border-border px-3 py-2 text-sm text-text-secondary transition-soft"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link href="/" className="text-text-primary">
              Home
            </Link>
            <Link href="/todos" className="text-text-primary">
              Todos
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/todos/create" className="text-text-primary">
                  Create
                </Link>
                <button
                  className="text-text-secondary text-left"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-text-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
