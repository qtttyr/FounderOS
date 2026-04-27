const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export interface ChatResponse {
  response: string;
  model: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  status: string;
  type?: string;
}

export interface CaptureResponse {
  kind: string;
  classification: string;
  suggestedProject: string | null;
}

export async function askMira(
  message: string,
  context?: string,
  model: string = "gemini-2.5-flash"
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to get response from Mira");
  }

  return res.json();
}

export async function getModels(): Promise<{ models: ModelInfo[] }> {
  const res = await fetch(`${API_BASE}/models/list`);
  return res.json();
}

export async function getHistory(): Promise<{ messages: any[] }> {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
}

export async function clearHistory(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/history`, { method: "DELETE" });
  return res.json();
}

export async function capture(
  text: string,
  context?: string
): Promise<CaptureResponse> {
  const res = await fetch(`${API_BASE}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, context }),
  });

  if (!res.ok) {
    return { kind: "note", classification: "", suggestedProject: null };
  }

  return res.json();
}

export interface ImageResponse {
  url?: string;
  error?: string;
}

export interface VideoResponse {
  url?: string;
  error?: string;
  duration?: number;
}

export async function generateImage(
  prompt: string,
  provider: string = "zsky"
): Promise<ImageResponse> {
  const res = await fetch(`${API_BASE}/generate/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider }),
  });
  return res.json();
}

export async function generateVideo(
  prompt: string,
  provider: string = "zsky",
  duration: number = 5
): Promise<VideoResponse> {
  const res = await fetch(`${API_BASE}/generate/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider, duration }),
  });
  return res.json();
}

export interface SettingsResponse {
  openweather_key?: string;
  gemini_api_key?: string;
  glasses_ip?: string;
}

export async function getSettings(): Promise<SettingsResponse> {
  const res = await fetch(`${API_BASE}/settings`);
  return res.json();
}

export async function updateSettings(settings: {
  openweather_key?: string;
  gemini_api_key?: string;
  glasses_ip?: string;
}): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}