import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickMetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="min-h-[138px] border border-border/60 bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center border border-border/60 bg-background/70 text-primary">
            {icon}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-3">
        <CardTitle className="text-2xl sm:text-3xl">{value}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
