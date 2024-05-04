import React from "react";
import { Link } from "react-router-dom";

const VideoCard = ({ data }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${views / 1000000}M Views`;
    } else if (views >= 1000) {
      return `${views / 1000}K Views`;
    } else {
      return `${views} Views`;
    }
  };

  const handleChannelClick = () => {
    history.push(data.channelLink);
  };
  return (
    <Link
      to={data.videoLink}
      className="w-[24%] bg-white/80 h-[35%] text-black flex flex-col rounded-lg mt-1 hover:border  p-2 transition-all duration-150 ease-in-out "
    >
      <div className="mb-5">
        <img src={data.thumbnail} alt="thumbnail" className="w-full h-[30%] " />
      </div>
      <div className=" w-full items-center justify-center flex mb-2 gap-1  ">
        <img
          src={data.profilePic}
          alt="DP"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className=" w-[90%]  font-medium text-[16px] leading-6 ">
          {data.title}
        </h1>
      </div>

      <div className="w-full flex flex-col ml-14   font-normal text-[12px] leading-5 ">
        <div className="flex gap-2 ">
          <p>{formatViews(data.views)} </p>
          <p>•</p>
          <p>{data.uploadTime}</p>
        </div>
        <div>
          <Link to={data.channelLink}>{data.channel}</Link>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
