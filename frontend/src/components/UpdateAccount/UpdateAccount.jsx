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
    <div className="flex w-80 flex-col gap-4">
      <h1 className="text-lg font-black text-zinc-100">Update account</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleAccountUpdate}
      >
        <input
          type="text"
          className="h-12 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none transition focus:border-volt/60 focus:ring-2 focus:ring-volt/15"
          placeholder="Enter full name"
          onChange={(e) => {
            setData({ ...data, fullName: e.target.value });
          }}
        />
        <input
          type="email"
          className="h-12 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none transition focus:border-volt/60 focus:ring-2 focus:ring-volt/15"
          placeholder="Enter new email"
          onChange={(e) => {
            setData({ ...data, email: e.target.value });
          }}
        />
        <button
          type="submit"
          className="grid h-11 place-items-center rounded-xl bg-volt text-sm font-bold text-void transition hover:bg-volt-bright disabled:opacity-60"
          onClick={handleAccountUpdate}
        >
          {profileState.isLoading ? (
            <ScaleLoader
              loading={profileState.isLoading}
              color="#0A0A0F"
              height={20}
            />
          ) : (
            `Update details`
          )}
        </button>
      </form>
    </div>
  );
};

export default UpdateAccount;
