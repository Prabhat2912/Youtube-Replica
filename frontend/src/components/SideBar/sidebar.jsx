import React from "react";
import { Link, NavLink } from "react-router-dom";
import { RiHome6Line } from "react-icons/ri";
import { BiLike } from "react-icons/bi";
import { FaHistory } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { TbUserCheck } from "react-icons/tb";
import { FiVideo } from "react-icons/fi";
import { IoIosHelpCircleOutline } from "react-icons/io";

import { IoSettingsOutline } from "react-icons/io5";

const Sidebar = () => {
  return (
    <div className="bg-black w-1/5 min-h-[calc(100vh-72px)]  p-4 flex flex-col items-center justify-between  text-white border-r min-w-[200px] ">
      <div className="w-[90%] flex flex-col gap-2 ">
        {navLinks.map((navlink, i) => (
          <Link
            key={i}
            to={navlink.to}
            className="border  flex  items-center p-2 gap-2 "
          >
            {navlink.icon}
            {navlink.title}
          </Link>
        ))}
      </div>
      <div className="w-[90%] flex flex-col gap-2 ">
        {footerNav.map((navlink, i) => (
          <Link
            key={i}
            to="/"
            className="border  flex  items-center p-2 gap-2 "
          >
            {navlink.icon}
            {navlink.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

const navLinks = [
  {
    title: "Home",
    icon: <RiHome6Line />,
    to: "/",
  },
  {
    title: "Liked Videos",
    icon: <BiLike />,
    to: "/dashboard",
  },
  {
    title: "Watch History",
    icon: <FaHistory />,
    to: "/profile",
  },
  {
    title: "My content",
    icon: <FiVideo />,
    to: "/search-view",
  },
  {
    title: "Collection",
    icon: <FaFolder />,
    to: "/video",
  },
  {
    title: "Subscribers",
    icon: <TbUserCheck />,
    to: "/",
  },
];

const footerNav = [
  {
    title: "Support",
    icon: <IoIosHelpCircleOutline />,
  },
  {
    title: "Settings",
    icon: <IoSettingsOutline />,
  },
];
