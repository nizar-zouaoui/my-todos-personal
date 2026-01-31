type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "elevated";
};

const variants = {
  default: "bg-surface border border-border shadow-card",
  muted: "bg-surface-muted border border-border",
  elevated: "bg-surface border border-border shadow-hero",
};

export default function Card({
  children,
  className,
  variant = "default",
}: CardProps) {
  return (
    <div className={`rounded-lg ${variants[variant]} ${className || ""}`}>
      {children}
    </div>
  );
}
