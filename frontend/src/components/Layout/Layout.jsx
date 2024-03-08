import React from "react";

import Sidebar from "../SideBar/sidebar";

import { Outlet } from "react-router-dom";
import Header from "../Header/header";
const Layout = () => {
  return (
    <div>
      <Header />
      <div className="flex w-full ">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
