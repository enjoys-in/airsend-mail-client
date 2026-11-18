import { toast } from "sonner";
import {
  type CreateProjectInput,
  type CreateTaskInput,
  type TaskItem,
  type TaskStatus,
  type UpdateTaskInput,
} from "./tasks-types";
import * as api from "./tasks-api";

interface MutationProps {
  selectedTask: TaskItem | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TaskItem | null>>;
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  setAssignedTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  refreshTasks: () => Promise<void>;
  refreshAssignedTasks: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  setSelectedProjectId: (id: string) => void;
}

export function useTaskMutations({
  selectedTask,
  setSelectedTask,
  setTasks,
  setAssignedTasks,
  refreshTasks,
  refreshAssignedTasks,
  refreshProjects,
  setSelectedProjectId,
}: MutationProps) {
  const handleCreateTask = async (input: CreateTaskInput) => {
    const created = await api.createTask(input);
    if (created) {
      toast.success("Task created");
      await refreshTasks();
      void refreshAssignedTasks();
      return true;
    }
    toast.error("Failed to create task");
    return false;
  };

  const handleUpdateTask = async (id: string, input: UpdateTaskInput) => {
    const { labels: _, ...rest } = input;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...rest } : t)));
    setAssignedTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...rest } : t)));
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, ...rest } : null));
    }
    const ok = await api.updateTask(id, input);
    if (ok) {
      toast.success("Task updated");
      void refreshTasks();
      return true;
    }
    toast.error("Failed to update task");
    void refreshTasks();
    return false;
  };

  const handleMoveTaskStatus = async (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setAssignedTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const ok = await api.updateTaskStatus(id, status);
    if (!ok) {
      toast.error("Failed to move task");
      void refreshTasks();
      return false;
    }
    return true;
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setAssignedTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
    const ok = await api.deleteTask(id);
    if (ok) {
      toast.success("Task deleted");
      return true;
    }
    toast.error("Failed to delete task");
    void refreshTasks();
    return false;
  };

  const handleCreateProject = async (input: CreateProjectInput) => {
    const p = await api.createProject(input);
    if (p) {
      toast.success("Team project created");
      await refreshProjects();
      setSelectedProjectId(p.id);
      return true;
    }
    toast.error("Failed to create project");
    return false;
  };

  return {
    handleCreateTask,
    handleUpdateTask,
    handleMoveTaskStatus,
    handleDeleteTask,
    handleCreateProject,
  };
}
