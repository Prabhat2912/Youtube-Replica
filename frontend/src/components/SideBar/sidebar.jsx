import React from "react";
import { Link, NavLink } from "react-router-dom";
import { RiHome6Line } from "react-icons/ri";
import { BiLike } from "react-icons/bi";
import { FaHistory } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { TbUserCheck } from "react-icons/tb";
import { FiVideo } from "react-icons/fi";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoSettingsOutline } from "react-icons/io5";
import { useState } from "react";

const Sidebar = () => {
  const [btnClicked, setBtnClicked] = useState(false);
  const handleBtnClick = () => {
    setBtnClicked((prev) => !prev);
  };
  return (
    <div
      className={`bg-white ${
        btnClicked ? "w-[70px]" : "w-1/5"
      } min-h-[calc(100vh-72px)]  p-4 flex flex-col items-center justify-between border-r  transition-all duration-150 ease-in-out `}
    >
      <div className="w-[90%] flex flex-col gap-2 ">
        <button
          onClick={handleBtnClick}
          className=" w-full  p-2 flex items-center gap-5 "
        >
          <GiHamburgerMenu /> {btnClicked ? "" : "PlayTube"}
        </button>
        {navLinks.map((navlink, i) => (
          <Link
            key={i}
            to={navlink.to}
            className=" flex  items-center p-2 gap-2 "
          >
            {navlink.icon}
            {btnClicked ? "" : navlink.title}
          </Link>
        ))}
      </div>
      <div className="w-[90%] flex flex-col gap-2 ">
        {footerNav.map((navlink, i) => (
          <Link key={i} to="/" className=" flex  items-center p-2 gap-2 ">
            {navlink.icon}
            {btnClicked ? "" : navlink.title}
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
