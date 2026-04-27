import { useState } from "react";
import { Check, Radar, Save, Wifi } from "lucide-react";

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
import { pingGlasses, sendAIResponse } from "@/services/glasses";

export default function Settings() {
  const { state, updateSettings: updateLocalSettings } = useFounderStore();
  const [pingState, setPingState] = useState<"idle" | "loading" | "done" | "fail">("idle");
  const [testState, setTestState] = useState<"idle" | "loading" | "done">("idle");

  const handlePing = async () => {
    setPingState("loading");
    const ok = await pingGlasses();
    setPingState(ok ? "done" : "fail");
    window.setTimeout(() => setPingState("idle"), 2000);
  };

  const handleTestAI = async () => {
    setTestState("loading");
    await sendAIResponse("Test from Founder OS");
    setTestState("done");
    window.setTimeout(() => setTestState("idle"), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
      <section>
        <Card className="border border-primary/15 bg-[linear-gradient(180deg,rgba(18,31,34,0.92),rgba(12,16,23,0.92))]">
          <CardHeader>
            <SectionHeading
              eyebrow="HUD"
              title="Подключение очков"
              detail="IP адрес очков в локальной сети Wi-Fi."
            />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={state.settings.glassesIp}
                onChange={(event) => updateLocalSettings({ glassesIp: event.target.value })}
                placeholder="192.168.1.105"
                className="text-lg"
              />
              <Button className="min-h-12 gap-2" onClick={handlePing}>
                {pingState === "loading" ? (
                  <Radar size={16} className="animate-spin" />
                ) : pingState === "done" ? (
                  <Check size={16} />
                ) : pingState === "fail" ? (
                  <Radar size={16} />
                ) : (
                  <Wifi size={16} />
                )}
                {pingState === "loading" ? "Проверяю..." : pingState === "done" ? "Связь есть" : pingState === "fail" ? "Нет связи" : "Проверить"}
              </Button>
            </div>
            <Button variant="outline" className="min-h-11 gap-2" onClick={handleTestAI}>
              {testState === "done" ? <Check size={15} /> : <Save size={15} />}
              {testState === "loading" ? "Тест..." : testState === "done" ? "Отправлено!" : "Тест AI → Очки"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <CardTitle>Город для погоды</CardTitle>
            <CardDescription>Отображается на главном экране.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={state.settings.weatherCity}
              onChange={(event) => updateLocalSettings({ weatherCity: event.target.value })}
              placeholder="Astana"
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border border-border/60 bg-card/75">
          <CardHeader>
            <CardTitle>VIP контакты</CardTitle>
            <CardDescription>Чьи уведомления показать без задержки.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={state.settings.vipContacts}
              onChange={(event) => updateLocalSettings({ vipContacts: event.target.value })}
              placeholder="Иван, Мама"
            />
            <p className="text-sm text-muted-foreground">Через запятую, без пробелов.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}