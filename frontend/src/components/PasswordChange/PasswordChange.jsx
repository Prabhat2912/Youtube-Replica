import React from "react";
import { useSelector } from "react-redux";
import {
  changePassword,
  selectProfile,
} from "../../Redux/Features/Profile/ProfileSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { ScaleLoader } from "react-spinners";

const PasswordChange = ({ isModalOpen }) => {
  const profileState = useSelector(selectProfile);
  const [pass, setPass] = useState({ oldPassword: "", newPassword: "" });
  const dispatch = useDispatch();

  const handlePassChange = (e) => {
    e.preventDefault();
    const passChangePromise = () => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await dispatch(changePassword(pass));
          if (res.payload) {
            isModalOpen(false);
            resolve(res.payload);
          } else {
            reject(new Error(res.payload?.error || "Password change failed"));
          }
        } catch (error) {
          reject(new Error("An error occurred while changing password"));
        }
      });
    };
    toast.promise(passChangePromise, {
      loading: "Loading...",
      success: () => `Password Changed Successfully`,
      error: (error) => `Error:${error}`,
    });
  };

  return (
    <div className="w-80 flex flex-col  mt-2 rounded-md gap-6 ">
      <h1>Change Password</h1>
      <form
        className="flex flex-col justify-center bg-gray-200  rounded-md  p-4 gap-6"
        onSubmit={handlePassChange}
      >
        <input
          type="password"
          className="px-4 py-2 rounded-md outline-none "
          placeholder="Enter old password"
          onChange={(e) => {
            setPass({ ...pass, oldPassword: e.target.value });
          }}
        />
        <input
          type="text"
          className="px-4 py-2 rounded-md outline-none "
          placeholder="Enter new password"
          onChange={(e) => {
            setPass({ ...pass, newPassword: e.target.value });
          }}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-md bg-gray-900 ${
            profileState.isLoading ? "" : "hover:bg-gray-500"
          }  text-white transition-all h-10 duration-150 ease-in`}
          onClick={handlePassChange}
        >
          {profileState.isLoading ? (
            <ScaleLoader
              loading={profileState.isLoading}
              color="white"
              height={20}
            />
          ) : (
            ` Change Password`
          )}
        </button>
      </form>
    </div>
  );
};

export default PasswordChange;
