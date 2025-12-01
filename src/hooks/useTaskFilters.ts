import { useMemo } from "react";
import { Task } from "../types/Task";
import { TaskFilters } from "../types/Task";
import { filterTasks } from "../utils/filterTasks";

export const useTaskFilters = (tasks: Task[], filters: TaskFilters) => {
  const filtered = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  return filtered;
};