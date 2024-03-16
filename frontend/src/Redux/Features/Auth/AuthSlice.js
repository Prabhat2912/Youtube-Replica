import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "./AuthApi";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const res = await authApi.login(credentials);
      if (!res) {
        return thunkAPI.rejectWithValue("Login failed");
      }

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
export const register = createAsyncThunk(
  "auth/register",
  async (credentials, thunkAPI) => {
    try {
      const res = await authApi.register(credentials);
      if (!res) {
        return thunkAPI.rejectWithValue("Registration failed");
      }

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState = {
  isLoading: false,
  isLogin: false,
  refreshToken: null,
  accessToken: null,
  isError: null,
  message: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLogin = true;
        state.refreshToken = action.payload.refreshToken;
        state.accessToken = action.payload.accessToken;
        state.isError = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.isError = false;
      })
      .addCase(register.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
