import React from "react";
import { useSelector } from "react-redux";
import {
  selectProfile,
  updateAccount,
} from "../../Redux/Features/Profile/ProfileSlice";
import { useState } from "react";
import { ScaleLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  checkAuthOnRefresh,
  setUser,
} from "../../Redux/Features/Auth/AuthSlice";

const UpdateAccount = ({ isModalOpen }) => {
  const profileState = useSelector(selectProfile);
  const dispatch = useDispatch();
  const [data, setData] = useState({ email: "", fullName: "" });
  const handleAccountUpdate = (e) => {
    e.preventDefault();
    const accountUpdatePromise = () => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await dispatch(updateAccount(data));
          if (res.payload) {
            isModalOpen(false);
            resolve(res.payload);

            await dispatch(setUser(res.payload?.data));
          } else {
            reject(new Error(res.payload?.error || "Account update failed"));
          }
        } catch (error) {
          reject(new Error("An error occurred while updating the account"));
        }
      });
    };
    toast.promise(accountUpdatePromise, {
      loading: "Loading...",
      success: () => `Account updated Successfully`,
      error: (error) => `Error:${error}`,
    });
  };

  return (
    <div className="w-80 flex flex-col  mt-2 rounded-md gap-6 ">
      <h1>Update Account Details</h1>
      <form
        className="flex flex-col justify-center bg-gray-200  rounded-md  p-4 gap-6"
        onSubmit={handleAccountUpdate}
      >
        <input
          type="text"
          className="px-4 py-2 rounded-md outline-none "
          placeholder="Enter full name"
          onChange={(e) => {
            setData({ ...data, fullName: e.target.value });
          }}
        />
        <input
          type="email"
          className="px-4 py-2 rounded-md outline-none "
          placeholder="Enter new email"
          onChange={(e) => {
            setData({ ...data, email: e.target.value });
          }}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-md bg-gray-900 ${
            profileState.isLoading ? "" : "hover:bg-gray-500"
          }  text-white transition-all h-10 duration-150 ease-in`}
          onClick={handleAccountUpdate}
        >
          {profileState.isLoading ? (
            <ScaleLoader
              loading={profileState.isLoading}
              color="white"
              height={20}
            />
          ) : (
            ` Update Details`
          )}
        </button>
      </form>
    </div>
  );
};

export default UpdateAccount;
