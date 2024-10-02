import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "./AuthApi";
import Cookies from "js-cookie";
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

export const refreshToken = createAsyncThunk('auth/refreshToken', async (refreshToken, thunkAPI) => {
  try {
    const res = await authApi.refreshToken(refreshToken);
    if (!res) {
      return thunkAPI.rejectWithValue("Token refresh failed");
    }
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  // Just clear the local storage and cookies
  try {
    localStorage.removeItem("user");
    localStorage.removeItem('refreshToken');
    Cookies.remove('accessToken');
    return; // Return undefined to resolve the thunk
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});


export const checkAuthOnRefresh = createAsyncThunk(
  "auth/checkAuthOnRefresh",
  async (_, thunkAPI) => {
    try {
      const accessToken = Cookies.get("accessToken");
      const refreshTokens = localStorage.getItem("refreshToken");

      if (accessToken) {
        return { accessToken, refreshTokens };
      } else if (refreshTokens) {

        const result = await thunkAPI.dispatch(refreshToken(refreshTokens));
        if (refreshToken.fulfilled.match(result)) {
          return result.payload;
        } else {
          return thunkAPI.rejectWithValue(result.payload);
        }
      } else {
        return thunkAPI.rejectWithValue("No tokens available");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
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
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {

      state.user = action.payload
    }
  },
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
        state.user = action.payload.user;
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
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      }).addCase(refreshToken.rejected, (state, action) => {
        state.message = action.payload.message
      }).addCase(checkAuthOnRefresh.fulfilled, (state, action) => {
        state.isLogin = true;
        state.user = JSON.parse(localStorage.getItem("user"))
        state.accessToken = action.payload?.accessToken;
        state.refreshToken = action.payload?.refreshToken;
      }).addCase(checkAuthOnRefresh.rejected, (state) => {
        state.isLogin = false;
      }).addCase(logout.fulfilled, (state) => {

        state.isLogin = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

  },
});

export const selectAuth = (state) => state.auth;
export const { setUser } = authSlice.actions
export default authSlice.reducer;
