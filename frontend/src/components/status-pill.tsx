import { cn } from "@/lib/utils";

export function StatusPill({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-2 border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em]",
        tone === "default" && "border-border/70 bg-muted/40 text-muted-foreground",
        tone === "success" && "border-primary/30 bg-primary/10 text-primary",
        tone === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-200",
        tone === "danger" && "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "default" && "bg-muted-foreground/50",
          tone === "success" && "bg-primary",
          tone === "warning" && "bg-amber-300",
          tone === "danger" && "bg-destructive"
        )}
      />
      {label}
    </span>
  );
}
