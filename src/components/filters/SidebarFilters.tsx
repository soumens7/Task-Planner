import React from "react";
import { useTaskContext } from "../../context/TaskContext";
import { TaskCategory } from "../../types/Task";

const categoryOptions: { label: string; value: TaskCategory }[] = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Review", value: "review" },
  { label: "Completed", value: "completed" },
];

const timeOptions: { label: string; value: 1 | 2 | 3 | null }[] = [
  { label: "All", value: null },
  { label: "Within 1 week", value: 1 },
  { label: "Within 2 weeks", value: 2 },
  { label: "Within 3 weeks", value: 3 },
];

const SidebarFilters: React.FC = () => {
  const { filters, setFilters } = useTaskContext();

  const toggleCategory = (cat: TaskCategory) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const handleTimeRangeChange = (value: 1 | 2 | 3 | null) => {
    setFilters((prev) => ({
      ...prev,
      timeRangeWeeks: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Filters</h2>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{ display: "block", fontSize: 12, marginBottom: 4 }}
          htmlFor="search"
        >
          Search by task name
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={handleSearchChange}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        />
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>Categories</div>
        {categoryOptions.map((opt) => {
          const checked = filters.categories.includes(opt.value);
          return (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(opt.value)}
              />
              {opt.label}
            </label>
          );
        })}
      </div>

      {/* Time range filter */}
      <div>
        <div style={{ fontSize: 12, marginBottom: 4 }}>Time Range</div>
        <select
          value={filters.timeRangeWeeks ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            handleTimeRangeChange(
              val === "" ? null : (Number(val) as 1 | 2 | 3)
            );
          }}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        >
          {timeOptions.map((opt) => (
            <option key={opt.label} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SidebarFilters;