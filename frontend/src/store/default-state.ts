import type { FounderState } from "@/types/app";

const nowIso = new Date().toISOString();

export const defaultFounderState: FounderState = {
  projects: [],
  aiMessages: [],
  captures: [],
  settings: {
    glassesIp: "",
    weatherCity: "Astana",
    openWeatherKey: "",
    geminiKey: "",
    notionToken: "",
    notionDbId: "",
    vipContacts: "",
    autoSync: false,
  },
  weather: null,
};