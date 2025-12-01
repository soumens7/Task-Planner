import React from "react";
import { Task } from "../../types/Task";

interface TaskBarProps {
  task: Task;
  onDragStartMove: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDragStartResize: (
    id: string,
    side: "start" | "end",
    e: React.DragEvent<HTMLSpanElement>
  ) => void;
  onClickEdit: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  todo: "#6c757d",
  "in-progress": "#0d6efd",
  review: "#fd7e14",
  completed: "#198754",
};

const TaskBar: React.FC<TaskBarProps> = ({
  task,
  onDragStartMove,
  onDragStartResize,
  onClickEdit,
}) => {
  const bg = categoryColors[task.category] || "#6c757d";

  
  const title = `${task.name} (${task.category})
${task.startDate} → ${task.endDate}`;

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()} // prevent day selection on interactions
      style={{
        marginTop: 4,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        cursor: "default",
      }}
      title={title}
    >
      {/* LEFT RESIZE HANDLE */}
      <span
        draggable
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStartResize(task.id, "start", e); 
        }}
        style={{
          width: 6,
          height: "100%",
          cursor: "ew-resize",
          flexShrink: 0,
        }}
      />

      {/* MIDDLE = MOVE + EDIT */}
      <div
        draggable 
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          
          onDragStartMove(task.id, e);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClickEdit(task);
        }}
        style={{
          padding: "2px 6px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
          cursor: "grab",
        }}
      >
        {task.name}
      </div>

      {/* RIGHT RESIZE HANDLE */}
      <span
        draggable
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStartResize(task.id, "end", e); 
        }}
        style={{
          width: 6,
          height: "100%",
          cursor: "ew-resize",
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export default TaskBar;