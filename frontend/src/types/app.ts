export type ProjectStatus = "idea" | "active" | "paused" | "done";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  dueLabel: string;
};

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  summary: string;
  hudLine: string;
  tasks: Task[];
};

export type AIMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

export type CaptureItem = {
  id: string;
  text: string;
  kind: "task" | "idea" | "note" | "contact";
  projectId: string | null;
  createdAt: string;
};

export type FounderSettings = {
  glassesIp: string;
  weatherCity: string;
  openWeatherKey: string;
  geminiKey: string;
  notionToken: string;
  notionDbId: string;
  vipContacts: string;
  autoSync: boolean;
};

export type WeatherSnapshot = {
  temp: number;
  city: string;
  updatedAt: string;
};

export type FounderState = {
  projects: Project[];
  aiMessages: AIMessage[];
  captures: CaptureItem[];
  settings: FounderSettings;
  weather: WeatherSnapshot | null;
};
