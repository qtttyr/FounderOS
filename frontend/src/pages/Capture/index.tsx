import { useMemo, useState } from "react";
import {
  AudioLines,
  ContactRound,
  Lightbulb,
  NotebookText,
  PlusCircle,
  SquareCheckBig,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFounderStore } from "@/store/founder-store";
import { capture } from "@/services/mira";
import type { CaptureItem } from "@/types/app";

function classifyCapture(text: string): CaptureItem["kind"] {
  const lower = text.toLowerCase();
  if (lower.includes("позвон") || lower.includes("контакт")) return "contact";
  if (lower.includes("сделать") || lower.includes("задач")) return "task";
  if (lower.includes("иде") || lower.includes("придум")) return "idea";
  return "note";
}

const kindIcon = {
  task: SquareCheckBig,
  idea: Lightbulb,
  note: NotebookText,
  contact: ContactRound,
};

export default function Capture() {
  const { state, addCapture, addTask } = useFounderStore();
  const [value, setValue] = useState("");

  const projectOptions = useMemo(
    () => state.projects.map((project) => project.id),
    [state.projects]
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="border border-primary/15 bg-[linear-gradient(180deg,rgba(18,31,34,0.92),rgba(11,17,22,0.92))]">
          <CardHeader>
            <SectionHeading
              eyebrow="Capture"
              title="Быстро поймать мысль"
              detail="Сделал экран так, чтобы его можно было открыть и за несколько секунд сохранить идею, задачу или заметку."
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              className="flex min-h-64 w-full flex-col items-center justify-center gap-4 border border-primary/20 bg-primary/10 p-6 text-center transition-colors hover:bg-primary/14"
            >
              <div className="flex h-16 w-16 items-center justify-center border border-primary/30 bg-background/60 text-primary">
                <AudioLines size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-base font-medium">Voice Capture</div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Здесь позже подключим Web Speech API. Пока оставил удобный ручной поток без лишнего трения.
                </p>
              </div>
            </button>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Например: сделать экран быстрых заметок"
              />
              <Button
                className="min-h-11 gap-2"
                onClick={async () => {
                  const clean = value.trim();
                  if (!clean) return;

                  let kind: CaptureItem["kind"] = "note";
                  try {
                    const result = await capture(clean);
                    kind = result.kind as CaptureItem["kind"];
                  } catch {
                    kind = classifyCapture(clean);
                  }

                  const projectId = projectOptions[0] ?? null;
                  addCapture({
                    text: clean,
                    kind,
                    projectId,
                  });
                  if (kind === "task" && projectId) {
                    addTask(projectId, clean);
                  }
                  setValue("");
                }}
              >
                <PlusCircle size={15} />
                Сохранить
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <CardTitle>Как это раскладывается</CardTitle>
            <CardDescription>
              Простая логика: задача, идея, заметка или контакт. Этого достаточно для первого удобного потока.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["task", "Задача", "Сразу уходит в рабочий поток проекта."],
              ["idea", "Идея", "Остаётся лёгкой карточкой для будущей проработки."],
              ["note", "Заметка", "Фиксируем наблюдение без лишней структуры."],
              ["contact", "Контакт", "Помечаем важный follow-up или человека."],
            ].map(([key, title, detail]) => {
              const Icon = kindIcon[key as CaptureItem["kind"]];
              return (
                <div key={key} className="border border-border/50 bg-background/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                      <Icon size={16} />
                    </div>
                    <div className="text-sm font-medium">{title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card className="border border-border/60 bg-card/75">
        <CardHeader>
          <CardTitle>Последние captures</CardTitle>
          <CardDescription>
            История всегда под рукой, чтобы не терять ход мысли.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {state.captures.map((capture) => {
            const Icon = kindIcon[capture.kind];
            return (
              <div
                key={capture.id}
                className="flex gap-3 border border-border/50 bg-background/45 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{capture.text}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {capture.kind} • {new Date(capture.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
