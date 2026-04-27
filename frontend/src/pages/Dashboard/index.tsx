import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  CalendarDays,
  CloudSun,
  Cpu,
  Gauge,
  RadioTower,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

import { QuickMetricCard } from "@/components/quick-metric-card";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useFounderStore } from "@/store/founder-store";
import { updateHUD } from "@/services/glasses";
import { fetchWeather } from "@/services/weather";

const chartData = [
  { day: "Mon", flow: 42 },
  { day: "Tue", flow: 58 },
  { day: "Wed", flow: 54 },
  { day: "Thu", flow: 72 },
  { day: "Fri", flow: 67 },
  { day: "Sat", flow: 61 },
];

const chartConfig = {
  flow: {
    label: "Flow",
    color: "var(--color-primary)",
  },
};

export default function Dashboard() {
  const { state, metrics, setWeather } = useFounderStore();
  const [now, setNow] = useState(new Date());
  const [syncState, setSyncState] = useState<"idle" | "loading" | "done">("idle");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncWeather = async () => {
      const latest = await fetchWeather();
      if (latest) {
        setWeather({
          ...latest,
          updatedAt: new Date().toISOString(),
        });
      }
    };

    void syncWeather();
  }, [setWeather]);

  useEffect(() => {
    if (!state.settings.autoSync || !state.settings.glassesIp) return;

    const syncLoop = async () => {
      await updateHUD({
        time: now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now
          .toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          })
          .toUpperCase(),
        temp: state.weather?.temp ?? 0,
        city: state.weather?.city ?? state.settings.weatherCity,
        projects: metrics.activeProjects,
        tasks: metrics.todayTasks,
      });
    };

    syncLoop();
    const interval = window.setInterval(syncLoop, 60000);
    return () => window.clearInterval(interval);
  }, [state.settings.autoSync, state.settings.glassesIp]);

  const nextTasks = useMemo(
    () =>
      state.projects
        .flatMap((project) =>
          project.tasks
            .filter((task) => !task.done)
            .map((task) => ({ ...task, projectName: project.name }))
        )
        .slice(0, 4),
    [state.projects]
  );

  const handleSync = async () => {
    setSyncState("loading");
    await updateHUD({
      time: now.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: now
        .toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
        .toUpperCase(),
      temp: state.weather?.temp ?? 0,
      city: state.weather?.city ?? state.settings.weatherCity,
      projects: metrics.activeProjects,
      tasks: metrics.todayTasks,
    });
    setSyncState("done");
    window.setTimeout(() => setSyncState("idle"), 1800);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-grid border border-primary/15 bg-[linear-gradient(180deg,rgba(18,31,34,0.95),rgba(11,16,21,0.92))] shadow-[0_0_0_1px_rgba(110,231,183,0.04),0_24px_60px_rgba(0,0,0,0.35)]">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusPill label="Live Control" tone="success" />
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {now.toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-5xl leading-none sm:text-6xl">
                {now.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardTitle>
              <CardDescription className="max-w-xl text-sm leading-6 sm:text-[15px]">
                Комфортный мобильный центр для очков, задач и AI. Важное видно
                сразу, ключевые действия в один тап.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <QuickMetricCard
                icon={<Gauge size={18} />}
                label="Focus"
                value={`${metrics.focusScore}%`}
                detail="Темп и управляемость дня"
              />
              <QuickMetricCard
                icon={<RadioTower size={18} />}
                label="Projects"
                value={String(metrics.activeProjects)}
                detail="Активных треков сейчас"
              />
              <QuickMetricCard
                icon={<CloudSun size={18} />}
                label="Weather"
                value={state.weather ? `${state.weather.temp}°` : "--"}
                detail={state.weather?.city ?? state.settings.weatherCity}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="min-h-12 flex-1 justify-center gap-2 whitespace-normal text-sm leading-5"
                onClick={() => void handleSync()}
              >
                {syncState === "loading" ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {syncState === "done" ? "HUD обновлён" : "Синхронизировать с очками"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-12 gap-2 whitespace-normal text-sm leading-5"
              >
                <Sparkles size={16} />
                Быстрый бриф дня
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/75 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Следующее окно</CardTitle>
                <CardDescription>
                  Самое близкое, что хочется держать перед глазами.
                </CardDescription>
              </div>
              <CalendarDays size={18} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-primary/20 bg-primary/8 p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-primary/70">
                17:30
              </div>
              <div className="mt-2 text-lg font-medium">Сборка Founder OS UI</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Проверить HUD sync, AI-экран и поток быстрого ввода с телефона.
              </p>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">AI status</span>
                <span className="text-primary">Ready</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">HUD payload</span>
                <span>{metrics.todayTasks} tasks + weather</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto sync</span>
                <span>{state.settings.autoSync ? "Enabled" : "Off"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <SectionHeading
              eyebrow="Today"
              title="Главное на ближайший ритм"
              detail="Показываю задачи компактно, чтобы их было удобно быстро просмотреть и сразу отправить на HUD."
            />
          </CardHeader>
          <CardContent>
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent>
                {nextTasks.map((task) => (
                  <CarouselItem key={task.id} className="md:basis-1/2">
                    <Card className="h-full border border-border/50 bg-background/60">
                      <CardHeader>
                        <CardDescription>{task.projectName}</CardDescription>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <span>Срок</span>
                          <span>{task.dueLabel}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Приоритет</span>
                          <span className="capitalize">{task.priority}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <SectionHeading
              eyebrow="Flow"
              title="Нагрузка недели"
              detail="Лёгкий график для ощущения темпа без визуального шума."
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="flow"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#flowFill)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <SectionHeading
              eyebrow="Calendar"
              title="Рядом с графиком"
              detail="Мини-календарь оставил видимым прямо на главном экране, без лишних переходов."
            />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <SectionHeading
              eyebrow="Signals"
              title="Оперативная сводка"
              detail="Состояние системы и короткие подсказки под рукой."
            />
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              {
                icon: <Cpu size={16} />,
                title: "AI готов к коротким ответам",
                detail:
                  "Форматируем ответы так, чтобы их можно было сразу кинуть на HUD.",
              },
              {
                icon: <CloudSun size={16} />,
                title: `Погода ${state.weather?.temp ?? "--"}°`,
                detail: `Город: ${state.weather?.city ?? state.settings.weatherCity}`,
              },
              {
                icon: <RadioTower size={16} />,
                title: "HUD payload compact",
                detail:
                  "Сводка уже укладывается в короткие строки для OLED-дисплея.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 border border-border/50 bg-background/40 p-3"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
