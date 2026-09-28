import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendOtp, verifyOtp } from "../../../function/otpApi";

export const requestOtp = createAsyncThunk(
  "otp/request",
  async (email, thunkAPI) => {
    try {
      const res = await sendOtp(email);
      return { email, ...res };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Could not send code");
    }
  }
);

export const confirmOtp = createAsyncThunk(
  "otp/confirm",
  async ({ email, code }, thunkAPI) => {
    const res = await verifyOtp(email, code);
    if (res.verified) return { email, via: res.via };
    return thunkAPI.rejectWithValue(res.error || "Verification failed");
  }
);

const initialState = {
  email: "",
  status: "idle", // idle | sending | sent | verifying | verified
  via: null,
  cooldownUntil: 0,
  attempts: 0,
  error: null,
};

const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
      state.error = null;
    },
    resetOtp: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestOtp.pending, (state) => {
        state.status = "sending";
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.status = "sent";
        state.email = action.payload.email;
        state.via = action.payload.via;
        state.cooldownUntil = Date.now() + 30 * 1000;
        state.attempts = 0;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(confirmOtp.pending, (state) => {
        state.status = "verifying";
        state.error = null;
      })
      .addCase(confirmOtp.fulfilled, (state, action) => {
        state.status = "verified";
        state.via = action.payload.via;
      })
      .addCase(confirmOtp.rejected, (state, action) => {
        state.status = "sent";
        state.attempts += 1;
        state.error = action.payload;
      });
  },
});

export const { setEmail, resetOtp } = otpSlice.actions;
export const selectOtp = (state) => state.otp;
export default otpSlice.reducer;
