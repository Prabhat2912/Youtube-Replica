import axios from "axios";
import BASE_URL from "../../../../BaseURL";


const changePassword = async (credentials) => {
    try {

        const response = await axios.post(`${BASE_URL}/users/change-password`, credentials);
        return response?.data;

    } catch (error) {
        console.log("Error changing Password", error)
    }
}
const updateAccount = async (credentials) => {
    try {

        const res = await axios.patch(`${BASE_URL}/users/update-account`, credentials);
        return res.data;

    } catch (error) {
        console.log("Error updating account", error)
    }
}
const updateAvatar = async (credentials) => {
    try {
        const res = await axios.patch(`${BASE_URL}/users/avatar`, credentials);
        return res.data;
    } catch (error) {
        console.log("Error updating avatar", error)
    }
};
const updateCoverImage = async (credentials) => {
    try {
        const res = await axios.patch(`${BASE_URL}/users/cover-image`, credentials);
        return res.data;
    } catch (error) {
        console.log("Error updating cover-image", error)
    }
};

const profileApi = {
    updateAccount, updateAvatar, updateCoverImage, changePassword
}
export default profileApi;