import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { toast } from "sonner";

const Dropdown = ({ isOpen }) => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged Out Successfully");
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
        <p>Change Password</p>
        <p>Change Profile Picture</p>
        <p>Change Cover Image</p>
        <p>Update Account</p>
      </div>
      <button className="border-t-2 p-2 w-full mt-4 " onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dropdown;
