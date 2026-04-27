import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { defaultFounderState } from "@/store/default-state";
import type {
  AIMessage,
  CaptureItem,
  FounderSettings,
  FounderState,
  Project,
  ProjectStatus,
  Task,
  WeatherSnapshot,
} from "@/types/app";

const STORAGE_KEY = "founder-os-state-v1";

type FounderStoreValue = {
  state: FounderState;
  metrics: {
    activeProjects: number;
    todayTasks: number;
    completedTasks: number;
    focusScore: number;
  };
  upsertProject: (payload: {
    id?: string;
    name: string;
    summary: string;
    status: ProjectStatus;
  }) => void;
  addTask: (projectId: string, title: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  addAIMessage: (payload: Omit<AIMessage, "id" | "createdAt">) => void;
  addCapture: (payload: Omit<CaptureItem, "id" | "createdAt">) => void;
  updateSettings: (patch: Partial<FounderSettings>) => void;
  setWeather: (weather: WeatherSnapshot | null) => void;
};

const FounderStoreContext = createContext<FounderStoreValue | null>(null);

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

function readInitialState(): FounderState {
  if (typeof window === "undefined") {
    return defaultFounderState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultFounderState;
  }

  try {
    return { ...defaultFounderState, ...JSON.parse(raw) } as FounderState;
  } catch {
    return defaultFounderState;
  }
}

export function FounderStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FounderState>(readInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.localStorage.setItem("glasses_ip", state.settings.glassesIp);
    window.localStorage.setItem("weather_city", state.settings.weatherCity);
    window.localStorage.setItem("openweather_key", state.settings.openWeatherKey);
    window.localStorage.setItem("gemini_key", state.settings.geminiKey);
    window.localStorage.setItem("notion_token", state.settings.notionToken);
    window.localStorage.setItem("notion_db_id", state.settings.notionDbId);
  }, [state]);

  const upsertProject = useCallback(
    (payload: { id?: string; name: string; summary: string; status: ProjectStatus }) => {
      setState((current) => {
        const hudLine = payload.name.slice(0, 18);
        if (payload.id) {
          return {
            ...current,
            projects: current.projects.map((project) =>
              project.id === payload.id
                ? { ...project, name: payload.name, summary: payload.summary, status: payload.status, hudLine }
                : project
            ),
          };
        }

        const nextProject: Project = {
          id: createId("project"),
          name: payload.name,
          summary: payload.summary,
          status: payload.status,
          hudLine,
          tasks: [],
        };

        return { ...current, projects: [nextProject, ...current.projects] };
      });
    },
    []
  );

  const addTask = useCallback((projectId: string, title: string) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: [
                {
                  id: createId("task"),
                  title,
                  done: false,
                  priority: "medium",
                  dueLabel: "Сегодня",
                } satisfies Task,
                ...project.tasks,
              ],
            }
          : project
      ),
    }));
  }, []);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
              ),
            }
          : project
      ),
    }));
  }, []);

  const addAIMessage = useCallback(
    (payload: Omit<AIMessage, "id" | "createdAt">) => {
      setState((current) => ({
        ...current,
        aiMessages: [
          ...current.aiMessages,
          {
            id: createId("msg"),
            createdAt: new Date().toISOString(),
            ...payload,
          },
        ],
      }));
    },
    []
  );

  const addCapture = useCallback(
    (payload: Omit<CaptureItem, "id" | "createdAt">) => {
      setState((current) => ({
        ...current,
        captures: [
          {
            id: createId("capture"),
            createdAt: new Date().toISOString(),
            ...payload,
          },
          ...current.captures,
        ].slice(0, 10),
      }));
    },
    []
  );

  const updateSettings = useCallback((patch: Partial<FounderSettings>) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...patch,
      },
    }));
  }, []);

  const setWeather = useCallback((weather: WeatherSnapshot | null) => {
    setState((current) => ({ ...current, weather }));
  }, []);

  const metrics = useMemo(() => {
    const allTasks = state.projects.flatMap((project) => project.tasks);
    const activeProjects = state.projects.filter(
      (project) => project.status === "active"
    ).length;
    const todayTasks = allTasks.filter((task) => !task.done).length;
    const completedTasks = allTasks.filter((task) => task.done).length;
    const focusScore = Math.max(
      52,
      Math.min(97, 76 + activeProjects * 3 - todayTasks + completedTasks * 2)
    );

    return {
      activeProjects,
      todayTasks,
      completedTasks,
      focusScore,
    };
  }, [state.projects]);

  const value = useMemo<FounderStoreValue>(
    () => ({
      state,
      metrics,
      upsertProject,
      addTask,
      toggleTask,
      addAIMessage,
      addCapture,
      updateSettings,
      setWeather,
    }),
    [
      state,
      metrics,
      upsertProject,
      addTask,
      toggleTask,
      addAIMessage,
      addCapture,
      updateSettings,
      setWeather,
    ]
  );

  return (
    <FounderStoreContext.Provider value={value}>
      {children}
    </FounderStoreContext.Provider>
  );
}

export function useFounderStore() {
  const context = useContext(FounderStoreContext);
  if (!context) {
    throw new Error("useFounderStore must be used within FounderStoreProvider");
  }

  return context;
}
