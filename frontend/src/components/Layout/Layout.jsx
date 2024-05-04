import React, { useState } from "react";
import Sidebar from "../SideBar/sidebar";
import { Outlet } from "react-router-dom";
import Header from "../Header/header";
import Login from "../Login/Login";

const Layout = () => {
  return (
    <div>
      <div>
        <Header />
        <div className="flex w-full h-[calc(100vh-72px)] ">
          <Sidebar />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
