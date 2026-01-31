import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-primary text-background shadow-card hover:-translate-y-0.5 hover:shadow-hero",
  secondary:
    "border border-border text-text-primary bg-surface hover:-translate-y-0.5 hover:shadow-card",
  subtle: "text-text-secondary hover:text-text-primary",
};

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: keyof typeof variants;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
  className,
  type = "button",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classNames = `${base} ${variants[variant]} ${
    isDisabled ? "opacity-60 cursor-not-allowed" : ""
  } ${className || ""}`;
  if (href) {
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
