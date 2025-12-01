import React from "react";
import { format, addMonths } from "date-fns";
import { useTaskContext } from "../../context/TaskContext";

const CalendarHeader: React.FC = () => {
  const { selectedMonth, setSelectedMonth } = useTaskContext();

  const goPrev = () => setSelectedMonth((prev) => addMonths(prev, -1));
  const goNext = () => setSelectedMonth((prev) => addMonths(prev, 1));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 16,
        justifyContent: "space-between",
      }}
    >
      <div>
        <button onClick={goPrev} style={{ marginRight: 8 }}>
          ◀
        </button>
        <button onClick={goNext}>▶</button>
      </div>
      <h2 style={{ margin: 0 }}>{format(selectedMonth, "MMMM yyyy")}</h2>
      <div />
    </div>
  );
};

export default CalendarHeader;