// authApi.js
import axios from "axios";
import BASE_URL from "../../../../BaseURL";

const login = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, credentials);
    const refreshToken = response?.data?.data?.refreshToken;
    localStorage.setItem("refreshToken", refreshToken);
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log("Login Error: ", err);
  }
};

const authApi = {
  login,
};

export default authApi;
