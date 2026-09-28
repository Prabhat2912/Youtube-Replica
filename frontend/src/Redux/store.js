import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./Features/Auth/AuthSlice";
import ProfileSlice from './Features/Profile/ProfileSlice';
import OtpSlice from "./Features/Otp/OtpSlice";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    profile: ProfileSlice,
    otp: OtpSlice,
  },
});

export default store;
