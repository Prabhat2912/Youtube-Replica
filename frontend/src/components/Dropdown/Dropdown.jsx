import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { toast } from "sonner";
import Modal from "../Modal/Modal";
import PasswordChange from "../PasswordChange/PasswordChange";
import { useState } from "react";
import UpdateAccount from "../UpdateAccount/UpdateAccount";

const Dropdown = ({ isOpen }) => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged Out Successfully");
  };

  const [passModal, setPassModal] = useState(false);
  const openPassModal = () => {
    setPassModal(true);
  };
  const closePassModal = () => {
    setPassModal(false);
  };
  const [accModal, setAccModal] = useState(false);
  const openAccModal = () => {
    setAccModal(true);
  };
  const closeAccModal = () => {
    setAccModal(false);
  };

  return (
    <div
      className={` w-[300px] border border-gray-300 shadow-md dropdown-menu absolute top-12 bg-white ${
        isOpen ? "block" : "hidden"
      } p-4 rounded-md right-0 transition-all duration-300 ease-in-out `}
    >
      <div className="flex  gap-2 ">
        <img
          src={user?.avatar}
          className="rounded-full"
          width={45}
          height={40}
        />
        <div>
          <h1>{user?.fullName}</h1>
          <h2>@{user?.username}</h2>
        </div>
      </div>
      <div className="mt-4 p-2 border-t-2 flex flex-col gap-6  ">
        <p onClick={openPassModal} className="cursor-pointer">
          Change Password
        </p>
        <p className="cursor-pointer">Change Profile Picture</p>
        <p className="cursor-pointer">Change Cover Image</p>
        <p className="cursor-pointer" onClick={openAccModal}>
          Update Account
        </p>
      </div>
      <button className="border-t-2 p-2 w-full mt-4 " onClick={handleLogout}>
        Logout
      </button>
      <Modal
        isOpen={passModal}
        onClose={closePassModal}
        style={{ top: 0, right: 0 }}
      >
        <PasswordChange isModalOpen={setPassModal} />
      </Modal>
      <Modal
        isOpen={accModal}
        onClose={closeAccModal}
        style={{ top: 0, right: 0 }}
      >
        <UpdateAccount isModalOpen={setAccModal} />
      </Modal>
    </div>
  );
};

export default Dropdown;
