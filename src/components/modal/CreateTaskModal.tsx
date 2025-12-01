import React, { useState, useEffect } from "react";
import { TaskCategory } from "../../types/Task";
import { format } from "date-fns";

import { useTaskContext } from "../../context/TaskContext"; 

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; category: TaskCategory }) => void;
  startDate: Date | null;
  endDate: Date | null;
}

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: "todo",        label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review",      label: "Review" },
  { value: "completed",   label: "Completed" },
];

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onClose,
  onCreate,
  startDate,
  endDate,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TaskCategory>("todo");
  const [error, setError] = useState("");

  //  pull editingTask + updateTask + setEditingTask from context
  const { editingTask, updateTask, setEditingTask } = useTaskContext(); 

  //  derive "isEdit" mode based on editingTask
  const isEdit = !!editingTask; 

  useEffect(() => {
    if (!open) return; //  early return when closed

    setError("");

    if (editingTask) {
      //  pre-fill form when editing
      setName(editingTask.name);
      setCategory(editingTask.category);
    } else {
      //reset for create mode
      setName("");
      setCategory("todo");
    }
  }, [open, editingTask]); //  added editingTask dependency

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Task name is required");
      return;
    }

    if (isEdit && editingTask) {
      // update existing task instead of creating new
      updateTask(editingTask.id, {
        name: trimmed,
        category,
      });
      setEditingTask(null); // clear editing state after save
      onClose();
      return;
    }

    // original create path
    onCreate({ name: trimmed, category });
    onClose();
  };

  // when editing, show the task's own range if props missing
  const startForLabel =
    startDate ?? (editingTask ? new Date(editingTask.startDate) : null); 
  const endForLabel =
    endDate ?? (editingTask ? new Date(editingTask.endDate) : null); 

  const rangeLabel =
    startForLabel && endForLabel
      ? `${format(startForLabel, "dd MMM yyyy")} – ${format(
          endForLabel,
          "dd MMM yyyy"
        )}`
      : "No range";

  const handleCancel = () => {
    // clear editing state on cancel
    setEditingTask(null); 
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onMouseDown={handleCancel} // use handleCancel so edit state clears
    >
      <div
        style={{
          width: 380,
          maxWidth: "90%",
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 18px 45px rgba(15,23,42,0.25)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>
          {isEdit ? "Edit Task" : "Create Task" /* dynamic title */}
        </h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: 16,
            fontSize: 13,
            color: "#666",
          }}
        >
          Selected range: <strong>{rangeLabel}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Task name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #d0d0d7",
                fontSize: 13,
              }}
              placeholder="Write a task name..."
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #d0d0d7",
                fontSize: 13,
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 12,
                color: "#c92a2a",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={handleCancel} // use handleCancel
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d0d0d7",
                background: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {isEdit ? "Save" : "Create" /* CHANGED: dynamic button text */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;