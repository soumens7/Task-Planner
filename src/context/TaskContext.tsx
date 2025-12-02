import React, { createContext, useContext, useState, useEffect } from "react";
import { addDays, differenceInCalendarDays } from "date-fns";
import { Task, TaskFilters } from "../types/Task";

interface TaskContextValue {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

  filters: TaskFilters;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilters>>;

  selectedMonth: Date;
  setSelectedMonth: React.Dispatch<React.SetStateAction<Date>>;

  addTask: (data: Omit<Task, "id">) => void;

  updateTask: (id: string, partial: Partial<Task>) => void;
  moveTask: (id: string, newStart: string) => void;
  resizeTask: (id: string, side: "start" | "end", newDate: string) => void;

  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const useTaskContext = (): TaskContextValue => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return ctx;
};

const initialFilters: TaskFilters = {
  categories: [],
  timeRangeWeeks: null,
  search: "",
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Demo seed tasks
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const seedTasks: Task[] = [
      {
        id: "1",
        name: "Design landing page",
        category: "in-progress",
        startDate: new Date(year, month, 5).toISOString(),
        endDate: new Date(year, month, 7).toISOString(),
      },
      {
        id: "2",
        name: "Marketing plan",
        category: "todo",
        startDate: new Date(year, month, 8).toISOString(),
        endDate: new Date(year, month, 10).toISOString(),
      },
      {
        id: "3",
        name: "Security features",
        category: "completed",
        startDate: new Date(year, month, 13).toISOString(),
        endDate: new Date(year, month, 14).toISOString(),
      },
      {
        id: "4",
        name: "New features",
        category: "review",
        startDate: new Date(year, month, 20).toISOString(),
        endDate: new Date(year, month, 20).toISOString(),
      },
    ];

    setTasks(seedTasks);
  }, []);

  const addTask = (data: Omit<Task, "id">) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        ...data,
      },
    ]);
  };

  // updateTask: shallow merge by id
  const updateTask = (id: string, partial: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    );
  };

  // moveTask: shift start/end by same offset (keep duration)
  const moveTask = (id: string, newStart: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const oldStart = new Date(t.startDate);
        const oldEnd = new Date(t.endDate);
        const duration = differenceInCalendarDays(oldEnd, oldStart); // span-1

        const newStartDate = new Date(newStart);
        const newEndDate = addDays(newStartDate, duration);

        return {
          ...t,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        };
      })
    );
  };

  // resizeTask: adjust just start or end
  const resizeTask = (id: string, side: "start" | "end", newDate: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const newDt = new Date(newDate);

        if (side === "start") {
          const currentEnd = new Date(t.endDate);
          if (newDt > currentEnd) return t; // ignore invalid
          return { ...t, startDate: newDt.toISOString() };
        } else {
          const currentStart = new Date(t.startDate);
          if (newDt < currentStart) return t; // ignore invalid
          return { ...t, endDate: newDt.toISOString() };
        }
      })
    );
  };

  const value: TaskContextValue = {
    tasks,
    setTasks,
    filters,
    setFilters,
    selectedMonth,
    setSelectedMonth,
    addTask,
    updateTask,
    moveTask,
    resizeTask,
    editingTask,
    setEditingTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};