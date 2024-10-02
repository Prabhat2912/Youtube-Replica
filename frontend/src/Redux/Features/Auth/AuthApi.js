// authApi.js
import axios from "axios";
import BASE_URL from "../../../../BaseURL";
import Cookies from 'js-cookie';
const login = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, credentials);
    const accessToken = response?.data?.data?.accessToken;
    Cookies.set('accessToken', accessToken, { expires: 7 })
    const user = response?.data?.data?.user;
    localStorage.setItem("user", JSON.stringify(user));
    const refreshToken = response?.data?.data?.refreshToken;
    localStorage.setItem("refreshToken", refreshToken);
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log("Login Error: ", err);
  }
};
const register = async (credentials) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/register`,
      credentials
    );

    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log("Login Error: ", err);
  }
};
const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/refresh-token`, refreshToken);
    const newRefreshToken = response?.data?.refreshToken;
    const newAccessToken = response?.data?.accessToken;
    Cookies.set("accessToken", newAccessToken, { expires: 7 });
    localStorage.setItem("refreshToken", newRefreshToken);

    return response.data;
  } catch (error) {
    console.log("Refresh token error", error);
  }
}
const logout = async () => {
  const response = await axios.post(`${BASE_URL}/users/logout`);
  console.log(response);
  return response.data;
}
const authApi = {
  login,
  refreshToken,
  register,
  logout
};

export default authApi;
