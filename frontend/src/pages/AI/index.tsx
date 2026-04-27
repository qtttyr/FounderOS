import { useEffect, useRef, useState } from "react";
import { 
  Brain, 
  Send,
  Plus,
  Check,
  Copy,
  Trash2,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFounderStore } from "@/store/founder-store";
import { askMira, getModels, getHistory, clearHistory } from "@/services/mira";
import { sendAIResponse } from "@/services/glasses";

interface Model {
  id: string;
  name: string;
}

export default function AI() {
  const { state, addAIMessage } = useFounderStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getModels().then((res) => {
      if (res.models?.[0]) {
        setSelectedModel(res.models[0]);
        setModels(res.models);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.aiMessages, streamingText]);

  const handleSubmit = async () => {
    const clean = prompt.trim();
    if (!clean || loading) return;

    addAIMessage({ role: "user", text: clean });
    setPrompt("");
    setLoading(true);
    setStreamingText("");

    try {
      const context = state.projects
        .map((p) => `${p.name}: ${p.summary}`)
        .join("; ");

      const response = await askMira(clean, context, selectedModel?.id);
      
      const words = response.response.split(" ");
      for (let i = 0; i < words.length; i++) {
        setStreamingText((prev) => prev + (prev ? " " : "") + words[i]);
        await new Promise((r) => setTimeout(r, 15));
      }
      
      addAIMessage({ role: "assistant", text: response.response });
    } catch (err) {
      addAIMessage({
        role: "assistant",
        text: "Ошибка. Проверь бэкенд.",
      });
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearChat = () => {
    state.aiMessages.forEach(() => addAIMessage({ role: "user", text: "" }));
  };

  const currentMessages = state.aiMessages;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          <span className="text-lg font-medium">Mira</span>
          <span className="text-xs text-muted-foreground ml-2">({selectedModel?.name})</span>
        </div>
        <div className="flex gap-2">
          {currentMessages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {currentMessages.length === 0 && !streamingText && (
            <div className="mt-20 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Brain size={32} className="text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-medium">Чем помочь?</h2>
              <p className="max-w-xs text-sm text-muted-foreground">
                Спроси — отвечу. Ответ можно отправить на очки.
              </p>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-sm"
                  onClick={() => setPrompt("Дай короткий бриф дня")}
                >
                  Бриф дня
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-sm"
                  onClick={() => setPrompt("Что важно сделать?")}
                >
                  Фокус задач
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-sm"
                  onClick={() => setPrompt("Дай идею для проекта")}
                >
                  Идея
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 text-sm"
                  onClick={() => setPrompt("Краткий совет")}
                >
                  Совет
                </Button>
              </div>
            </div>
          )}
          
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-6 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/40"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Brain size={14} className="text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
                {msg.role === "assistant" && (
                  <div className="mt-2 flex items-center gap-3 border-t border-border/20 pt-2">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={12} />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => sendAIResponse(msg.text.split(" ").slice(0, 15).join(" "))}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Send size={12} />
                      <span>На очки</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {streamingText && (
            <div className="mb-6 flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-card px-4 py-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingText}
                  <span className="animate-pulse ml-1">▊</span>
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/40 bg-card/50 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="relative rounded-xl border border-border/40 bg-background/60 transition-focus-within:border-primary/50">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Напиши сообщение..."
              className="max-h-32 w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
              rows={1}
              style={{ minHeight: '48px' }}
              disabled={loading}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <span className="text-xs text-muted-foreground">
                {selectedModel?.name}
              </span>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleSubmit}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <Send size={16} />
                )}
                <span>Отправить</span>
              </Button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Mira может ошибаться. Проверяй факты.
          </p>
        </div>
      </div>
    </div>
  );
}