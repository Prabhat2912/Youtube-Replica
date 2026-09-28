import React, { useEffect, useState } from "react";
import Sidebar, { SidebarDrawerContent } from "../SideBar/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../Header/header";
import { RxCross2 } from "react-icons/rx";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();

  // Whatever opens the menu on phones, navigating must close it.
  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-void">
      <Header
        onMenuClick={() => {
          if (window.innerWidth < 640) {
            setDrawer((v) => !v);
          } else {
            setCollapsed((v) => !v);
          }
        }}
      />
      <div className="flex w-full">
        <Sidebar collapsed={collapsed} />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer — the burger button finally does something */}
      <div className={`fixed inset-0 z-50 sm:hidden ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawer(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 border-r border-line bg-void p-3 transition-transform duration-300 ${
            drawer ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-label="Menu"
        >
          <div className="mb-2 flex justify-end">
            <button
              onClick={() => setDrawer(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            >
              <RxCross2 size={20} />
            </button>
          </div>
          <SidebarDrawerContent onNavigate={() => setDrawer(false)} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
