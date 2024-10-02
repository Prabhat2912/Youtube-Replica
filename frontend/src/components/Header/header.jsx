import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import { FaSearch } from "react-icons/fa";
import Modal from "../Modal/Modal";
import Login from "../Login/Login";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "../../Redux/Features/Auth/AuthSlice";

const Header = () => {
  const authState = useSelector(selectAuth);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const dispatch = useDispatch();
  const handleLogout = () => {
    // Dispatch the logout action to update the Redux state
    dispatch(logout());

    // Clear local storage and cookies
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    Cookies.remove("accessToken");
  };

  return (
    <div className="w-fullh-[72px] px-11 flex items-center justify-between border-b">
      <a href="/">
        <img src={logo} width={63} height={63} alt="logo" />
      </a>
      <div className="relative flex items-center w-1/4 rounded-md">
        <FaSearch className="absolute left-2" />
        <input
          type="text"
          placeholder="Search"
          className="w-full px-7 py-2 placeholder:p-1 font-semibold bg-transparent border-gray-300 border-2 rounded-xl focus:outline-none"
        />
      </div>
      <div className="flex gap-2 p-4 items-center">
        {authState.isLogin ? (
          <div>
            <img
              src={authState.user?.avatar}
              className="rounded-full"
              width={40}
              alt="profilepic"
            />
          </div>
        ) : (
          <>
            <button className="btn" onClick={openModal}>
              Log in
            </button>
            <Modal
              isOpen={isModalOpen}
              onClose={closeModal}
              style={{ top: modalPosition.top, right: modalPosition.right }}
            >
              <Login isModalOpen={setIsModalOpen} />
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
