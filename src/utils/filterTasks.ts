import { Task, TaskFilters } from "../types/Task";
import { differenceInCalendarDays, parseISO } from "date-fns";

export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter((task) => {
    const { categories, search, timeRangeWeeks } = filters;

    // Category filter (multi-select)
    if (categories.length > 0 && !categories.includes(task.category)) {
      return false;
    }

    // Search by name (case-insensitive)
    if (search.trim()) {
      const lower = search.toLowerCase();
      if (!task.name.toLowerCase().includes(lower)) {
        return false;
      }
    }

    // Time-based filter (if set)
    if (timeRangeWeeks) {
      const now = new Date();
      const end = parseISO(task.endDate);
      const diff = differenceInCalendarDays(end, now);

      if (diff < 0 || diff > timeRangeWeeks * 7) {
        return false;
      }
    }

    return true;
  });
};