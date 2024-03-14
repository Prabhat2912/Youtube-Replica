import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import authApi from "../../Redux/Features/Auth/AuthApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { login, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { useEffect } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import uploadOnCloudinary from "../../function/cloudinary";

const SignUp = () => {
  const [data, setData] = useState({
    fullName: "",
    avatar: "",
    coverImage: "",
    username: "",
    email: "",
    password: "",
  });

  const [images, setImages] = useState({ avatarFile: "", coverImageFile: "" });
  const authState = useSelector(selectAuth);
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res1 = await uploadOnCloudinary(images.avatarFile);

      setData({ ...data, avatar: res1.url });
      console.log("Avatar uploaded and data updated:", res1?.url);

      const res2 = await uploadOnCloudinary(images.coverImageFile);
      setData({ ...data, coverImage: res2.url });
      console.log("Cover image uploaded and data updated:", res2?.url);
    } catch (error) {
      console.error("Error signingUp in:", error);
    }
  };
  useEffect(() => {
    console.log(data.avatar, "avatar25");
    console.log(data.coverImage, "coverImage25");
  }, [data.avatar, data.coverImage]);
  useEffect(() => {
    console.log(images.avatarFile, "avatar");
    console.log(images.coverImageFile, "coverImage");
  }, [images]);

  return (
    <div className="w-full p-4 h-[full] flex flex-col justify-center  bg-black items-center ">
      <img src={logo} alt="" width={80} />
      <form
        className="flex flex-col justify-center  rounded-md shadow-md p-8 w-[400px]  gap-y-4 "
        onSubmit={handleSignUp}
      >
        <h1 className="text-white">Full Name</h1>
        <input
          type="text"
          onChange={(e) => setData({ ...data, fullName: e.target.value })}
          placeholder="Enter Full Name"
          className="outline-none px-4 py-2 rounded-md "
        />
        <h1 className="text-white">Username</h1>
        <input
          type="text"
          onChange={(e) => setData({ ...data, username: e.target.value })}
          placeholder="Enter Username"
          className="outline-none px-4 py-2 rounded-md   "
        />
        <h1 className="text-white">Email</h1>
        <input
          type="email"
          placeholder="Enter Email"
          className="px-4 py-2 rounded-md outline-none "
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        <h1 className="text-white">Password</h1>
        <input
          type="password"
          placeholder="Enter Password"
          className="px-4 py-2 rounded-md outline-none "
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <h1 className="text-white">Avatar</h1>
        <input
          type="file"
          className="px-4 py-2 rounded-md outline-none target:text-white "
          onChange={(e) =>
            setImages({ ...images, avatarFile: e.target.files[0] })
          }
          style={{ color: "white" }}
        />
        <h1 className="text-white">Cover Image</h1>
        <input
          type="file"
          className="px-4 py-2 rounded-md outline-none target:text-white "
          onChange={(e) =>
            setImages({ ...images, coverImageFile: e.target.files[0] })
          }
          style={{ color: "white" }}
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-500 text-white transition-all duration-150 ease-in hover:text-black"
        >
          SignUp
        </button>
      </form>
    </div>
  );
};

export default SignUp;
