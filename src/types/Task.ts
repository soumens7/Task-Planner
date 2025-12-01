export type TaskCategory = "todo" | "in-progress" | "review" | "completed";

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export interface TaskFilters {
  categories: TaskCategory[];     // multi-select
  timeRangeWeeks: 1 | 2 | 3 | null;
  search: string;
}