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
import PasswordField from "../PasswordField/PasswordField";

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
    <div className="flex w-80 flex-col gap-4">
      <h1 className="text-lg font-black text-zinc-100">Change password</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={handlePassChange}
      >
        <PasswordField
          className="h-12 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15"
          placeholder="Enter old password"
          onChange={(e) => {
            setPass({ ...pass, oldPassword: e.target.value });
          }}
        />
        <PasswordField
          className="h-12 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15"
          placeholder="Enter new password"
          onChange={(e) => {
            setPass({ ...pass, newPassword: e.target.value });
          }}
        />
        <button
          type="submit"
          className="grid h-11 place-items-center rounded-xl bg-ember text-sm font-bold text-void transition hover:bg-ember-bright disabled:opacity-60"
          onClick={handlePassChange}
        >
          {profileState.isLoading ? (
            <ScaleLoader
              loading={profileState.isLoading}
              color="#0A0A0F"
              height={20}
            />
          ) : (
            `Change password`
          )}
        </button>
      </form>
    </div>
  );
};

export default PasswordChange;
