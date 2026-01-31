type StatusPillProps = {
  label: string;
  variant?: "neutral" | "success" | "warning";
  className?: string;
};

const variants = {
  neutral: "bg-surface-muted text-text-secondary",
  success: "bg-surface-muted text-success",
  warning: "bg-surface-muted text-warning",
};

export default function StatusPill({
  label,
  variant = "neutral",
  className,
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        variants[variant]
      } ${className || ""}`}
    >
      {label}
    </span>
  );
}
