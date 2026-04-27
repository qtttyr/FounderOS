import { useState, useMemo } from "react";
import {
  FolderKanban,
  Plus,
  Send,
  MoreVertical,
  Lightbulb,
  Rocket,
  Pause,
  CheckCircle,
  ChevronDown,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFounderStore } from "@/store/founder-store";
import { sendNotification } from "@/services/glasses";
import type { ProjectStatus } from "@/types/app";

type TabType = "active" | "ideas" | "done";

export default function Projects() {
  const { state, addTask, toggleTask, upsertProject } = useFounderStore();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSummary, setNewProjectSummary] = useState("");
  const [newTaskByProject, setNewTaskByProject] = useState<Record<string, string>>({});
  const [showNewProject, setShowNewProject] = useState(false);

  const filteredProjects = useMemo(() => {
    return state.projects.filter(p => {
      if (activeTab === "active") return p.status === "active";
      if (activeTab === "ideas") return p.status === "idea" || p.status === "paused";
      if (activeTab === "done") return p.status === "done";
      return true;
    });
  }, [state.projects, activeTab]);

  const stats = useMemo(() => ({
    active: state.projects.filter(p => p.status === "active").length,
    ideas: state.projects.filter(p => p.status === "idea" || p.status === "paused").length,
    done: state.projects.filter(p => p.status === "done").length,
    tasksOpen: state.projects.flatMap(p => p.tasks).filter(t => !t.done).length,
  }), [state.projects]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    upsertProject({
      name: newProjectName.trim(),
      summary: newProjectSummary.trim() || "Новый проект",
      status: "active",
    });
    setNewProjectName("");
    setNewProjectSummary("");
    setShowNewProject(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <FolderKanban size={20} className="text-primary" />
          <span className="text-lg font-medium">Проекты</span>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowNewProject(true)}>
          <Plus size={16} />
          Новый
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-2 border-b border-border/40 bg-card/30 px-4 py-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeTab === "active" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Активные ({stats.active})
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeTab === "ideas" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Идеи ({stats.ideas})
        </button>
        <button
          onClick={() => setActiveTab("done")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeTab === "done" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Готовые ({stats.done})
        </button>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{stats.tasksOpen} задач</span>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border/40 bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Новый проект</h2>
              <button onClick={() => setShowNewProject(false)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Название проекта"
                autoFocus
              />
              <Input
                value={newProjectSummary}
                onChange={(e) => setNewProjectSummary(e.target.value)}
                placeholder="Краткое описание (необязательно)"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewProject(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button onClick={handleCreateProject} className="flex-1">
                  Создать
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProjects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FolderKanban size={48} className="mb-3 text-primary/30" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "active" && "Нет активных проектов"}
              {activeTab === "ideas" && "Нет идей"}
              {activeTab === "done" && "Нет завершённых"}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => setShowNewProject(true)}
            >
              Создать проект
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-border/40 bg-card/50 p-4 hover:border-border/60 transition-colors"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {project.status === "active" && <Rocket size={14} className="text-green-500" />}
                    {project.status === "idea" && <Lightbulb size={14} className="text-yellow-500" />}
                    {project.status === "paused" && <Pause size={14} className="text-orange-500" />}
                    {project.status === "done" && <CheckCircle size={14} className="text-blue-500" />}
                  </div>
                  <button
                    onClick={() => sendNotification(`${project.name}: ${project.hudLine}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Send size={14} className="text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {project.summary}
                </p>

                {/* Tasks Preview */}
                <div className="mt-3 space-y-1">
                  {project.tasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(project.id, task.id)}
                      className="flex w-full items-center gap-2 rounded py-1 text-left text-xs hover:bg-background/40"
                    >
                      <div className={`h-3 w-3 rounded-full border ${
                        task.done ? "bg-primary border-primary" : "border-border"
                      }`} />
                      <span className={task.done ? "line-through text-muted-foreground" : ""}>
                        {task.title}
                      </span>
                    </button>
                  ))}
                  {project.tasks.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-5">
                      + ещё {project.tasks.length - 3}
                    </p>
                  )}
                </div>

                {/* Add Task */}
                <div className="mt-3 flex gap-1">
                  <Input
                    value={newTaskByProject[project.id] || ""}
                    onChange={(e) => setNewTaskByProject(p => ({ 
                      ...p, 
                      [project.id]: e.target.value 
                    }))}
                    placeholder="задача..."
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = newTaskByProject[project.id]?.trim();
                        if (value) {
                          addTask(project.id, value);
                          setNewTaskByProject(p => ({ ...p, [project.id]: "" }));
                        }
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const value = newTaskByProject[project.id]?.trim();
                      if (value) {
                        addTask(project.id, value);
                        setNewTaskByProject(p => ({ ...p, [project.id]: "" }));
                      }
                    }}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}