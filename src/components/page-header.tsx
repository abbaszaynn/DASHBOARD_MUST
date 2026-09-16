import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Short label above the title, e.g. "COLLECTION" or "AGENT 03". */
  eyebrow?: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        // min-w-0 on the text column and shrink-0 on the actions is what keeps a
        // long description from growing past its column and running under the
        // buttons - a flex child's default min-width is its content, not zero.
        "mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="flex items-center gap-2.5 text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" />}
          <span className="min-w-0 break-words">{title}</span>
        </h1>
        {description && (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 md:shrink-0">{children}</div>
      )}
    </div>
  );
}
