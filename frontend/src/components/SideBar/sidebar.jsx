import React from "react";
import { Link, NavLink } from "react-router-dom";
import { RiHome6Line } from "react-icons/ri";
const Sidebar = () => {
  return (
    <div className="bg-black w-1/5 min-h-[calc(100vh-72px)]  p-4 flex flex-col items-center justify-between  text-white border-r min-w-[200px] ">
      <div className="w-[90%] flex flex-col gap-1 ">
        {" "}
        <Link to="/" className="border  flex  items-center p-2 gap-2 ">
          <RiHome6Line />
          Home
        </Link>
        <Link to="/" className="border  flex  items-center p-2 gap-2 ">
          <RiHome6Line />
          Home
        </Link>
        <Link to="/" className="border  flex  items-center p-2 gap-2 ">
          <RiHome6Line />
          Home
        </Link>
        <Link to="/" className="border  flex  items-center p-2 gap-2 ">
          <RiHome6Line />
          Home
        </Link>
      </div>
      <div className="w-[90%] flex flex-col gap-1">
        <Link to="/" className="border  flex  items-center p-2 gap-2 ">
          <RiHome6Line />
          Home
        </Link>
        <Link to="/" className="border  flex items-center p-2 gap-2 ">
          <RiHome6Line />
          Home
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
