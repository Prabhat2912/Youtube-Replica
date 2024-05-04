import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./Features/Auth/AuthSlice";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
  },
});

export default store;
