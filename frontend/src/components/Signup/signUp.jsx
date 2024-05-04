import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  login,
  register,
  selectAuth,
} from "../../Redux/Features/Auth/AuthSlice";
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
  const dispatch = useDispatch();
  const [preview, setPreview] = React.useState(null);

  const handleImageChange = (event, imageType) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setPreview({ ...preview, [imageType]: reader.result });
    };
  };

  const navigate = useNavigate();
  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const [res1, res2] = await Promise.all([
        uploadOnCloudinary(images.avatarFile),
        uploadOnCloudinary(images.coverImageFile),
      ]);
      const registerResponse = await dispatch(
        register({ ...data, avatar: res1.url, coverImage: res2.url })
      );
      console.log(registerResponse);
      if (registerResponse.payload) {
        const loginResponse = await dispatch(
          login({ username: data.username, password: data.password })
        );
        console.log(loginResponse);

        if (loginResponse.payload) {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="w-full p-4 h-[full]  flex flex-col justify-center   items-center ">
      <img src={logo} alt="" width={80} />
      <form
        className="flex flex-col  bg-gray-200 justify-center  rounded-md shadow-md p-8 w-[400px] transition-all duration-200 ease-in-out  gap-y-4 "
        onSubmit={handleSignUp}
      >
        <h1 className="">Full Name</h1>
        <input
          type="text"
          onChange={(e) => setData({ ...data, fullName: e.target.value })}
          placeholder="Enter Full Name"
          className="outline-none text-black px-4 py-2 rounded-md "
        />
        <h1 className="">Username</h1>
        <input
          type="text"
          onChange={(e) => setData({ ...data, username: e.target.value })}
          placeholder="Enter Username"
          className="outline-none text-black px-4 py-2 rounded-md   "
        />
        <h1 className="">Email</h1>
        <input
          type="email"
          placeholder="Enter Email"
          className="px-4 py-2 text-black rounded-md outline-none "
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
        <h1 className="">Password</h1>
        <input
          type="password"
          placeholder="Enter Password"
          className="px-4 py-2 text-black rounded-md outline-none "
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
        <h1 className="">Avatar</h1>
        <div className="border rounded-lg border-black">
          {" "}
          <input
            type="file"
            className="px-4 py-2 rounded-md border-b-2 w-full border-black outline-none  "
            onChange={(e) => {
              setImages({ ...images, avatarFile: e.target.files[0] });
              handleImageChange(e, "avatar");
            }}
          />
          {preview?.avatar && (
            <div className="flex w-full h-[50px] justify-center ">
              <img alt="avatar" src={preview.avatar} width={60} height={50} />
            </div>
          )}
        </div>

        <h1 className="">Cover Image</h1>
        <div className="border rounded-lg border-black">
          <input
            type="file"
            className="px-4 py-2 rounded-md border-b-2 w-full border-black outline-none  "
            onChange={(e) => {
              setImages({ ...images, coverImageFile: e.target.files[0] });
              handleImageChange(e, "coverImage");
            }}
          />
          {preview?.coverImage && (
            <div className="flex w-full h-[50px] justify-center ">
              <img
                alt="coverImage"
                src={preview.coverImage}
                width={60}
                height={60}
              />
            </div>
          )}{" "}
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-500 text-white transition-all duration-150 ease-in hover:text-black"
        >
          {authState.isLoading ? "Loading..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
