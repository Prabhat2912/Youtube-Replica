import React from "react";
import { NavLink } from "react-router-dom";
import { RiHome6Line } from "react-icons/ri";
import { MdOutlineExplore, MdOutlineSubscriptions } from "react-icons/md";
import { FiClock, FiThumbsUp, FiFolder, FiSettings } from "react-icons/fi";
import { BiHelpCircle } from "react-icons/bi";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-orange-50 text-orange-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const Sidebar = ({ collapsed }) => (
  <aside
    className={`${
      collapsed ? "w-[76px]" : "w-60"
    } hidden min-h-[calc(100vh-64px)] shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-3 transition-all duration-200 sm:flex`}
    aria-label="Primary"
  >
    <nav className="flex flex-col gap-1">
      <NavLink to="/home" className={linkCls} end>
        <RiHome6Line size={19} /> {!collapsed && "Home"}
      </NavLink>
      <NavLink to="/search" className={linkCls}>
        <MdOutlineExplore size={19} /> {!collapsed && "Explore"}
      </NavLink>
      <NavLink to="/dashboard" className={linkCls}>
        <MdOutlineSubscriptions size={19} /> {!collapsed && "Subscriptions"}
      </NavLink>
      <div className={`my-2 border-t border-slate-100 ${collapsed ? "mx-1" : "mx-2"}`} />
      <NavLink to="/profile" className={linkCls}>
        <FiClock size={18} /> {!collapsed && "History"}
      </NavLink>
      <NavLink to="/dashboard" className={linkCls}>
        <FiThumbsUp size={18} /> {!collapsed && "Liked"}
      </NavLink>
      <NavLink to="/dashboard" className={linkCls}>
        <FiFolder size={18} /> {!collapsed && "Library"}
      </NavLink>
    </nav>
    {!collapsed && (
      <div className="rounded-2xl bg-stone-100 p-4 text-[13px] leading-5 text-slate-600">
        <p className="font-semibold text-slate-900">New to PlayTube?</p>
        <p className="mt-1">Verify your email to upload, comment and save playlists.</p>
      </div>
    )}
    <div className="flex flex-col gap-1">
      <NavLink to="/profile" className={linkCls}>
        <FiSettings size={18} /> {!collapsed && "Settings"}
      </NavLink>
      <NavLink to="/" className={linkCls}>
        <BiHelpCircle size={18} /> {!collapsed && "Help"}
      </NavLink>
    </div>
  </aside>
);

export default Sidebar;
