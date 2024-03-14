import React, { useState } from "react";
import logo from "../../assets/images/logo.png";
import { FaSearch } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import Button from "../Button/button";
import Modal from "../Modal/Modal";
import Login from "../Login/Login";

const Header = () => {
  return (
    <div className="w-full h-[72px] px-11 flex items-center justify-between  bg-black border-b  ">
      <img src={logo} width={63} height={63} alt="logo" />
      <div className="  relative flex items-center w-1/4 ">
        {" "}
        <FaSearch className=" absolute left-2 text-white" />
        <input
          type="text"
          placeholder="Search"
          className=" w-full px-7 py-2 placeholder:p-1 font-semibold placeholder:text-white text-white bg-transparent border-gray-300 border-2 focus:outline-none "
        />
      </div>
      <div className="flex gap-2 p-4 items-center ">
        <Button icon={<BsThreeDotsVertical />} color={"white"} />

        <Button
          href={"/login"}
          text={"Log in"}
          color={"white"}
          bg={"transparent"}
          classes={
            "hover:bg-gray-800 rounded-md transition-all duration-300 ease-in-out  "
          }
        />

        <Button href={"/signup"} text={"Sign up"} hover={true} />
      </div>
    </div>
  );
};

export default Header;
