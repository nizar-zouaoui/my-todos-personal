import Link from "next/link";
import Button from "../ui/Button";

type HeaderProps = {
  isAuthenticated: boolean | null;
  onLogout: () => void;
};

export default function Header({ isAuthenticated, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary text-background grid place-items-center font-semibold shadow-card">
          T
        </div>
        <div>
          <p className="text-xs uppercase tracking-hero text-text-secondary">
            Taskflow
          </p>
          <h1 className="text-lg font-semibold text-text-primary">
            Calm productivity for modern teams
          </h1>
        </div>
      </div>
      <nav className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Button href="/todos" variant="secondary">
              My tasks
            </Button>
            <Button href="/todos/create" variant="primary">
              Create
            </Button>
            <Button variant="subtle" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button href="/login" variant="primary">
              Sign in
            </Button>
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-soft"
            >
              Book a demo
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
