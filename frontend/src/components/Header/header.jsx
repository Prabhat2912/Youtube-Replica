import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUpload, FiMenu } from "react-icons/fi";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import Logo from "../Brand/Logo";
import Modal from "../Modal/Modal";
import Login from "../Login/Login";
import Dropdown from "../Dropdown/Dropdown";

const Header = ({ onMenuClick }) => {
  const authState = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const close = (e) => {
      if (
        !e.target.closest(".dropdown-trigger") &&
        !e.target.closest(".dropdown-menu")
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/home");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-5">
      <button
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
        aria-label="Toggle menu"
      >
        <FiMenu size={20} />
      </button>
      <Logo />

      <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-xl items-center md:flex" role="search">
        <div className="relative w-full">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search videos, channels, topics"
            aria-label="Search videos"
            className="h-11 w-full rounded-full border border-slate-200 bg-stone-50 pl-11 pr-24 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Search
          </button>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        {authState.isLogin ? (
          <>
            <Link
              to="/dashboard"
              className="hidden h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 sm:flex"
            >
              <FiUpload /> Upload
            </Link>
            <div className="relative dropdown-trigger">
              <button onClick={() => setShowDropdown((v) => !v)} aria-label="Account menu">
                <img
                  src={authState.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=You`}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                  alt="Your profile"
                />
              </button>
              <Dropdown isOpen={showDropdown} />
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:flex">
              Log in
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="h-10 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-card hover:bg-orange-500"
            >
              Get started
            </button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <Login isModalOpen={setIsModalOpen} />
            </Modal>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
