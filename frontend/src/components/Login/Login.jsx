import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import authApi from "../../Redux/Features/Auth/AuthApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { login, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { useEffect } from "react";

const Login = () => {
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const handleData = (value) => {
    if (value.includes("@")) {
      setData({ ...data, email: value, username: "" });
    } else {
      setData({ ...data, email: "", username: value });
    }
  };

  const authState = useSelector(selectAuth);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(data));
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  useEffect(() => {
    console.log(authState);
    // const token = localStorage.getItem("refreshToken");
    // console.log(token);
  }, [authState]);

  return (
    <div className="w-full p-4 h-[100vh] flex flex-col justify-center  bg-black items-center ">
      <img src={logo} alt="" width={80} />
      <form
        className="flex flex-col justify-center  rounded-md shadow-md p-8 w-[400px]  gap-y-4 "
        onSubmit={handleLogin}
      >
        <h1 className="text-white">Username or Email</h1>
        <input
          type="text"
          onChange={(e) => handleData(e.target.value)}
          placeholder="enter username or password"
          className="outline-none px-4 py-2 rounded-md "
        />
        <h1 className="text-white">Password</h1>
        <input
          type="password"
          placeholder="enter password"
          className="px-4 py-2 rounded-md outline-none "
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-500 text-white transition-all duration-150 ease-in hover:text-black"
        >
          {authState.isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
