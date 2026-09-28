import React, { useState } from "react";
import Sidebar from "../SideBar/sidebar";
import { Outlet } from "react-router-dom";
import Header from "../Header/header";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-void">
      <Header onMenuClick={() => setCollapsed((v) => !v)} />
      <div className="flex w-full">
        <Sidebar collapsed={collapsed} />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
