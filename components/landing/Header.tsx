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
        <div className="h-10 w-10 rounded-xl bg-primary text-background grid place-items-center font-semibold shadow-card">
          T
        </div>
        <div>
          <p className="text-xs tracking-hero text-text-secondary">
            My Todos Personal
          </p>
          <h1 className="text-lg font-semibold text-text-primary">
            A cozy planner for your everyday lists
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
              Add task
            </Button>
            <Button variant="subtle" onClick={onLogout}>
              Sign out
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
              Take a quick tour
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
