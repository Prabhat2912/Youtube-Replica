import React, { useState } from "react";
import Sidebar from "../SideBar/sidebar";
import { Outlet } from "react-router-dom";
import Header from "../Header/header";
import Login from "../Login/Login";

const Layout = () => {
  const [loggedIn, setLoggedIn] = useState(true);

  const toggleLogin = () => {
    setLoggedIn((prev) => !prev);
  };

  return (
    <div>
      {loggedIn ? (
        <div>
          <Header />
          <div className="flex w-full h-[calc(100vh-72px)] ">
            <Sidebar />
            <Outlet />
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Layout;
