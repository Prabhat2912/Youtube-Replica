import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import authApi from "../../Redux/Features/Auth/AuthApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { login, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { useEffect } from "react";

const Login = ({ isModalOpen }) => {
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
      const res = dispatch(login(data));
      console.log(res);
      if (res?.data?.user) {
        navigate("/");
        isModalOpen(false);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  useEffect(() => {
    console.log(authState);
  }, [authState]);

  return (
    <div className="w-full p-4  flex flex-col justify-center   items-center ">
      <img src={logo} alt="" width={80} />
      <form
        className="flex flex-col justify-center bg-gray-200  rounded-md  p-8 w-[400px]  gap-y-4 "
        onSubmit={handleLogin}
      >
        <h1 className="">Username or Email</h1>
        <input
          type="text"
          onChange={(e) => handleData(e.target.value)}
          placeholder="Enter Username or Email"
          className="outline-none px-4 py-2 rounded-md "
        />
        <h1 className="">Password</h1>
        <input
          type="password"
          placeholder="Enter Password"
          className="px-4 py-2 rounded-md outline-none "
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-500 text-white transition-all duration-150 ease-in "
        >
          {authState.isLoading ? "Loading..." : "Login"}
        </button>
        <h1 className="w-full text-center">OR</h1>
        <button
          className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition-all duration-150 ease-in "
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
      </form>
    </div>
  );
};

export default Login;
