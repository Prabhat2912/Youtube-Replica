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
  const [accModal, setAccModal] = useState(false);

  return (
    <div
      className={`dropdown-menu absolute right-0 top-12 w-[300px] rounded-2xl border border-line bg-panel p-4 shadow-card ${
        isOpen ? "block" : "hidden"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="flex gap-3">
        <img
          src={user?.avatar}
          className="h-11 w-11 rounded-full object-cover"
          alt={user?.fullName || "Profile"}
        />
        <div className="min-w-0">
          <h1 className="truncate font-bold text-zinc-100">{user?.fullName}</h1>
          <h2 className="truncate text-sm text-zinc-500">@{user?.username}</h2>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1 border-t border-line p-2 text-sm">
        {[
          { label: "Change password", fn: () => setPassModal(true) },
          { label: "Update account", fn: () => setAccModal(true) },
        ].map((i) => (
          <p key={i.label} onClick={i.fn} className="cursor-pointer rounded-lg px-2 py-2 text-zinc-300 hover:bg-void">
            {i.label}
          </p>
        ))}
      </div>
      <button
        className="mt-2 w-full rounded-xl border border-line p-2.5 text-sm font-bold text-blaze-hot hover:border-blaze"
        onClick={handleLogout}
      >
        Log out
      </button>
      <Modal isOpen={passModal} onClose={() => setPassModal(false)}>
        <PasswordChange isModalOpen={setPassModal} />
      </Modal>
      <Modal isOpen={accModal} onClose={() => setAccModal(false)}>
        <UpdateAccount isModalOpen={setAccModal} />
      </Modal>
    </div>
  );
};

export default Dropdown;
