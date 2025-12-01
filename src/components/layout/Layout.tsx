import React from "react";
import SidebarFilters from "../filters/SidebarFilters";
import MonthView from "../calendar/MonthView";

const Layout: React.FC = () => {
  return (
    <div className="app-root">
      <aside
        style={{
          width: 260,
          borderRight: "1px solid #e2e2e6",
          padding: "16px",
          background: "#fff",
        }}
      >
        <SidebarFilters />
      </aside>

      <main style={{ flex: 1, padding: "16px" }}>
        <MonthView />
      </main>
    </div>
  );
};

export default Layout;