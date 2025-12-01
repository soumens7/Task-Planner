# 🗓️ Month View Task Planner

A **Google Calendar–like Month View Task Planner** built using **React + TypeScript**.  
This application allows users to visually create, schedule, move, resize, categorize, and filter tasks directly on a monthly calendar grid using drag & drop interactions.

---

## 🚀 Live Demo

> Check out the live version of the project [here](https://task-planner-jade-three.vercel.app/)

---

## ✨ Features

### ✅ Core Functionalities

- **Create Tasks via Drag Selection**

  - Drag across multiple calendar days to create a task.
  - A modal opens on release to enter task name and category.

- **Reschedule Tasks**

  - Drag the **middle of a task bar** to move it to a new date.
  - Task duration is automatically preserved.

- **Resize Tasks (Stretch Edges)**

  - Drag the **left edge** to update the **start date**.
  - Drag the **right edge** to update the **end date**.
  - Task range updates dynamically.

- **Task Categories**

  - To Do
  - In Progress
  - Review
  - Completed

- **Edit Tasks**

  - Click on a task to edit its name and category.

- **Filtering & Search**

  - Multi-select category filters.
  - Time-based filters: 1 week, 2 weeks, 3 weeks.
  - Live text search by task name.
  - All filters work cumulatively.

- **Month View Calendar UI**

  - Fixed monthly grid layout.
  - Continuous multi-day task bars (no per-day visual gaps).
  - Highlighted current date.
  - Clean and minimal UI.

- **State Management**
  - Centralized using **React Context API**.
  - In-memory storage (no backend required).

---

## 🛠 Tech Stack

- **React**
- **TypeScript**
- **date-fns** – Date manipulation
- **React Context API** – Global state management
- **Native HTML5 Drag & Drop API**
- **CSS-in-JS (inline styles)**

---

## 📂 Project Structure

src/
│
├── components/
│ ├── calendar/
│ │ ├── MonthView.tsx
│ │ ├── DayCell.tsx
│ │ ├── TaskBar.tsx
│ │ └── CalendarHeader.tsx
│ │
│ └── modal/
│ └── CreateTaskModal.tsx
│
├── context/
│ └── TaskContext.tsx
│
├── hooks/
│ └── useTaskFilters.ts
│
├── utils/
│ └── dateUtils.ts
│
├── types/
│ └── Task.ts
│
└── App.tsx

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>

2️⃣ Install Dependencies
npm install
3️⃣ Start the Development Server
npm start
The app will be available at:
http://localhost:3000

🧠 How the Application Works
	•	The monthly grid is generated using a month matrix (array of weeks).
	•	Tasks are stored and managed globally using React Context.
	•	Multi-day tasks are rendered using a weekly overlay grid, allowing:
	•	Continuous task bars across days.
	•	Accurate move & resize behavior.
	•	Drag payloads distinguish between:
	•	Move operations
	•	Resize operations
	•	Dragging task edges modifies only the start or end date.
	•	Dragging the task body shifts the entire task range.
	•	Filters are applied in real time using a custom filtering hook.
```
