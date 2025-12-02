import React, { useEffect, useState } from "react";
import { useTaskContext } from "../../context/TaskContext";
import {
  getMonthMatrix,
  isSameMonth,
  isSameDay,
  format,
} from "../../utils/dateUtils";
import DayCell from "./DayCell";
import CalendarHeader from "./CalendarHeader";
import { useTaskFilters } from "../../hooks/useTaskFilters";
import { Task } from "../../types/Task";
import {
  parseISO,
  isWithinInterval,
  differenceInCalendarDays,
} from "date-fns";
import CreateTaskModal from "../modal/CreateTaskModal";
import TaskBar from "./TaskBar";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const isDateWithinTask = (task: Task, date: Date): boolean => {
  const start = parseISO(task.startDate);
  const end = parseISO(task.endDate);
  return isWithinInterval(date, { start, end });
};

const isBetweenInclusive = (date: Date, a: Date, b: Date): boolean => {
  const t = date.getTime();
  const t1 = a.getTime();
  const t2 = b.getTime();
  const min = Math.min(t1, t2);
  const max = Math.max(t1, t2);
  return t >= min && t <= max;
};

type DragPayload =
  | { type: "move"; taskId: string }
  | { type: "resize"; taskId: string; side: "start" | "end" };

const serializePayload = (p: DragPayload) => JSON.stringify(p);
const parsePayload = (raw: string | null): DragPayload | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const MonthView: React.FC = () => {
  const {
    selectedMonth,
    tasks,
    filters,
    addTask,
    moveTask,
    resizeTask,
    setEditingTask,
  } = useTaskContext();

  const matrix = getMonthMatrix(selectedMonth); // weeks × 7
  const today = new Date();
  const visibleTasks = useTaskFilters(tasks, filters);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting && selectionStart && selectionEnd) {
        setIsSelecting(false);
        setShowModal(true);
      } else {
        setIsSelecting(false);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isSelecting, selectionStart, selectionEnd]);

  const handleDayMouseDown = (date: Date) => {
    setIsSelecting(true);
    setSelectionStart(date);
    setSelectionEnd(date);
  };

  const handleDayMouseEnter = (date: Date) => {
    if (!isSelecting || !selectionStart) return;
    setSelectionEnd(date);
  };

  const normalizedRange = (() => {
    if (!selectionStart || !selectionEnd)
      return { start: null as Date | null, end: null as Date | null };
    return selectionStart.getTime() <= selectionEnd.getTime()
      ? { start: selectionStart, end: selectionEnd }
      : { start: selectionEnd, end: selectionStart };
  })();

  const handleCreateTask = (data: { name: string; category: any }) => {
    if (!normalizedRange.start || !normalizedRange.end) return;

    addTask({
      name: data.name,
      category: data.category,
      startDate: normalizedRange.start.toISOString(),
      endDate: normalizedRange.end.toISOString(),
    });

    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // === DnD handlers for TaskBar ===
  const handleDragStartMove = (
    taskId: string,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-task",
      serializePayload({ type: "move", taskId })
    );
  };

  const handleDragStartResize = (
    taskId: string,
    side: "start" | "end",
    e: React.DragEvent<HTMLSpanElement>
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-task",
      serializePayload({ type: "resize", taskId, side })
    );
  };

  const handleDayDragOver = (
    targetDate: Date,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-task");
    const payload = parsePayload(raw);
    if (!payload || payload.type !== "resize") return;

    const iso = targetDate.toISOString();
    resizeTask(payload.taskId, payload.side, iso);
  };

  const handleDayDrop = (
    targetDate: Date,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-task");
    const payload = parsePayload(raw);
    if (!payload) return;

    const iso = targetDate.toISOString();

    if (payload.type === "move") {
      moveTask(payload.taskId, iso);
    } else if (payload.type === "resize") {
      resizeTask(payload.taskId, payload.side, iso);
    }
  };

  const handleTaskClickEdit = (task: Task) => {
    setEditingTask(task);
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    setSelectionStart(start);
    setSelectionEnd(end);
    setShowModal(true);
  };

  // --- helper to compute continuous segments per week with lanes ---
  type WeekSegment = {
    task: Task;
    colStart: number;
    colEnd: number;
    lane: number;
  };

  const getWeekSegments = (week: Date[]): WeekSegment[] => {
    const weekStart = week[0];
    const weekEnd = week[6];

    const rawSegments: Omit<WeekSegment, "lane">[] = [];

    visibleTasks.forEach((task) => {
      const tStart = parseISO(task.startDate);
      const tEnd = parseISO(task.endDate);

      // no overlap with this week
      if (tEnd < weekStart || tStart > weekEnd) return;

      // clamp to the week bounds
      const segStart = tStart < weekStart ? weekStart : tStart;
      const segEnd = tEnd > weekEnd ? weekEnd : tEnd;

      const colStart =
        differenceInCalendarDays(segStart, weekStart) + 1; // gridColumnStart (1-based)
      const colEnd = differenceInCalendarDays(segEnd, weekStart) + 2; // gridColumnEnd (exclusive)

      rawSegments.push({ task, colStart, colEnd });
    });

    
    const lanes: { colStart: number; colEnd: number }[][] = [];
    const withLanes: WeekSegment[] = [];

    rawSegments.forEach((seg) => {
      let laneIndex = 0;

      
      while (laneIndex < lanes.length) {
        const lane = lanes[laneIndex];
        const overlaps = lane.some(
          (existing) =>
            !(
              seg.colEnd <= existing.colStart || // seg ends before existing starts
              seg.colStart >= existing.colEnd // seg starts after existing ends
            )
        );
        if (!overlaps) break;
        laneIndex++;
      }

      if (!lanes[laneIndex]) {
        lanes[laneIndex] = [];
      }
      lanes[laneIndex].push({ colStart: seg.colStart, colEnd: seg.colEnd });

      withLanes.push({ ...seg, lane: laneIndex });
    });

    return withLanes;
  };

  const todayRef = today;

  return (
    <>
      <CalendarHeader />

      {/* weekday header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
          fontSize: 12,
          fontWeight: 600,
          color: "#666",
        }}
      >
        {weekdayLabels.map((label) => (
          <div key={label} style={{ textAlign: "center" }}>
            {label}
          </div>
        ))}
      </div>

      {/* month as stacked week-rows, each with a base grid + overlay */}
      <div style={{ border: "1px solid #e2e2e6" }}>
        {matrix.map((week, rowIndex) => {
          const segments = getWeekSegments(week);

          return (
            <div key={rowIndex} style={{ position: "relative" }}>
              {/* base day grid for the week */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gridAutoRows: "minmax(80px, auto)",
                }}
              >
                {week.map((date) => {
                  const key = format(date, "yyyy-MM-dd") + rowIndex;

                  const isSelected =
                    selectionStart && selectionEnd
                      ? isBetweenInclusive(date, selectionStart, selectionEnd)
                      : false;

                  return (
                    <div
                      key={key}
                      onDragOver={(e) => handleDayDragOver(date, e)}
                      onDrop={(e) => handleDayDrop(date, e)}
                    >
                      <DayCell
                        date={date}
                        isCurrentMonth={isSameMonth(date, selectedMonth)}
                        isToday={isSameDay(date, todayRef)}
                        isSelected={!!isSelected}
                        onMouseDown={() => handleDayMouseDown(date)}
                        onMouseEnter={() => handleDayMouseEnter(date)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* overlay grid that draws continuous TaskBars spanning columns in multiple lanes */}
              <div
                style={{
                  pointerEvents: "none", // let clicks go through, except on bars
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gridTemplateRows: `repeat(${
                    segments.length
                      ? Math.max(...segments.map((s) => s.lane)) + 1
                      : 1
                  }, minmax(24px, auto))`,
                }}
              >
                {segments.map(({ task, colStart, colEnd, lane }) => (
                  <div
                    key={`${task.id}-${lane}`}
                    style={{
                      gridColumnStart: colStart,
                      gridColumnEnd: colEnd,
                      gridRowStart: lane + 1,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 4px",
                    }}
                  >
                    <div style={{ width: "100%", pointerEvents: "auto" }}>
                      <TaskBar
                        task={task}
                        onDragStartMove={handleDragStartMove}
                        onDragStartResize={handleDragStartResize}
                        onClickEdit={handleTaskClickEdit}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        open={showModal && !!normalizedRange.start && !!normalizedRange.end}
        onClose={() => {
          setShowModal(false);
          setSelectionStart(null);
          setSelectionEnd(null);
          setEditingTask(null);
        }}
        onCreate={handleCreateTask}
        startDate={normalizedRange.start}
        endDate={normalizedRange.end}
      />
    </>
  );
};

export default MonthView;