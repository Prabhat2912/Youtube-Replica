import axios from "axios";
import BASE_URL from "../../../../BaseURL";
import Cookies from 'js-cookie'
import { useDispatch } from 'react-redux';
import { setUser } from '../Auth/AuthSlice';

const changePassword = async (credentials) => {
    try {
        const token = await Cookies.get('accessToken')
        if (!token) {
            throw new Error('No token found');
        }

        const response = await axios.post(`${BASE_URL}/users/change-password`, credentials, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response?.data;

    } catch (error) {
        console.log("Error changing Password", error)
    }
}
const updateAccount = async (credentials) => {

    try {
        const token = await Cookies.get('accessToken')
        if (!token) {
            throw new Error('No token found');
        }
        const res = await axios.patch(`${BASE_URL}/users/update-account`, credentials, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.data.user) {

        }
        return res.data;

    } catch (error) {
        console.log("Error updating account", error)
    }
}
const updateAvatar = async (credentials) => {
    try {
        const token = await Cookies.get('accessToken')
        if (!token) {
            throw new Error('No token found');
        }
        const res = await axios.patch(`${BASE_URL}/users/avatar`, credentials, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    } catch (error) {
        console.log("Error updating avatar", error)
    }
};
const updateCoverImage = async (credentials) => {
    try {
        const token = await Cookies.get('accessToken')
        if (!token) {
            throw new Error('No token found');
        }
        const res = await axios.patch(`${BASE_URL}/users/cover-image`, credentials, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    } catch (error) {
        console.log("Error updating cover-image", error)
    }
};

const profileApi = {
    updateAccount, updateAvatar, updateCoverImage, changePassword
}
export default profileApi;