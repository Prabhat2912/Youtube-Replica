import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import profileApi from './ProfileApi'

const initialState = {
    isLoading: false,
    isError: false,
    avatar: null,
    coverImage: null,
    password: null,
    user: null,
    message: null

}

export const changePassword = createAsyncThunk(
    'profile/changePassword', async (credentials, thunkApi) => {
        try {
            const res = await profileApi.changePassword(credentials);
            if (!res) {
                return thunkApi.rejectWithValue("Password change failed");
            }
            return res;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }

    }
)
export const updateAccount = createAsyncThunk(
    'profile/updateAccount', async (credentials, thunkApi) => {
        try {
            const res = await profileApi.updateAccount(credentials);
            if (!res) {
                return thunkApi.rejectWithValue("Account update failed");
            }
            return res;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }

    }
)
export const updateAvatar = createAsyncThunk(
    'profile/updateAvatar', async (credentials, thunkApi) => {
        try {
            const res = await profileApi.updateAvatar(credentials);
            if (!res) {
                return thunkApi.rejectWithValue("Avatar update failed");
            }
            return res;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }

    }
)
export const updateCoverImage = createAsyncThunk(
    'profile/updateCoverImage', async (credentials, thunkApi) => {
        try {
            const res = await profileApi.updateCoverImage(credentials);
            if (!res) {
                return thunkApi.rejectWithValue("Cover Image update failed");
            }
            return res;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }

    }
)



const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(changePassword.pending, (state) => {
            state.isError = false;
            state.isLoading = true;
        }).addCase(changePassword.fulfilled, (state, action) => {
            state.isError = false;
            state.isLoading = false
            state.message = action.payload.message
        }).addCase(changePassword.rejected, (state, action) => {
            state.isError = true;
            state.isLoading = false
            state.message = action.payload.message

        }).addCase(updateAccount.pending, (state) => {
            state.isError = false;
            state.isLoading = true;
        }).addCase(updateAccount.fulfilled, (state, action) => {
            state.isError = false;
            state.isLoading = false
            state.message = action.payload.message
        }).addCase(updateAccount.rejected, (state, action) => {
            state.isError = true;
            state.isLoading = false
            state.message = action.payload.message
            state.user = action.payload?.user

        }).addCase(updateAvatar.pending, (state) => {
            state.isError = false;
            state.isLoading = true;
        }).addCase(updateAvatar.fulfilled, (state, action) => {
            state.isError = false;
            state.isLoading = false
            state.message = action.payload.message
        }).addCase(updateAvatar.rejected, (state, action) => {
            state.isError = true;
            state.isLoading = false
            state.message = action.payload.message
            state.user = action.payload?.user

        }).addCase(updateCoverImage.pending, (state) => {
            state.isError = false;
            state.isLoading = true;
        }).addCase(updateCoverImage.fulfilled, (state, action) => {
            state.isError = false;
            state.isLoading = false
            state.message = action.payload.message
        }).addCase(updateCoverImage.rejected, (state, action) => {
            state.isError = true;
            state.isLoading = false
            state.message = action.payload.message
            state.user = action.payload?.user

        })
    }
})

export const selectProfile = (state) => state.profile;
export default profileSlice.reducer