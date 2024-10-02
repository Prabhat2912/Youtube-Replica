import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./Features/Auth/AuthSlice";
import ProfileSlice from './Features/Profile/ProfileSlice';

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    profile: ProfileSlice
  },
});

export default store;
