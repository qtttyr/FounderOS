type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  detail,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.28em] text-primary/70">
          {eyebrow}
        </div>
        <h2 className="text-balance text-xl font-medium leading-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {detail ? (
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {detail}
          </p>
        ) : null}
      </div>
      {action ? <div className="sm:self-end">{action}</div> : null}
    </div>
  );
}
