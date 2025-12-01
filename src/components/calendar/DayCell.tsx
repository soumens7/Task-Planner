// components/calendar/DayCell.tsx
import React from "react";
import { format } from "date-fns";
import { Task } from "../../types/Task";

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;

}

const DayCell: React.FC<DayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  onMouseDown,
  onMouseEnter,
}) => {
  const dayNumber = format(date, "d");

  const bgBase = isCurrentMonth ? "#fff" : "#f4f4f7";
  const bg = isSelected ? "#e0ebff" : bgBase;
  const borderColor = isSelected ? "#2563eb" : "#e2e2e6";

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={{
        border: `1px solid ${borderColor}`,
        padding: "4px",
        minHeight: 80,
        background: bg,
        position: "relative",
        fontSize: 12,
        userSelect: "none",
        cursor: "default",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: isToday ? 700 : 500,
          color: isToday ? "#0d6efd" : "#555",
        }}
      >
        {dayNumber}
      </div>

      {/* no TaskBars inside cells anymore – tasks are drawn in MonthView overlay */}
      <div style={{ marginTop: 2 }} />
    </div>
  );
};

export default DayCell;