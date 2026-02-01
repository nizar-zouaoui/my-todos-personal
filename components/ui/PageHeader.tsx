type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {subtitle && (
          <p className="text-xs tracking-hero text-text-secondary">
            {subtitle}
          </p>
        )}
        <h1 className="text-h1 text-text-primary">{title}</h1>
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}
