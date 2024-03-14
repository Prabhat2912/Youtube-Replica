import React from "react";
import VideoCard from "../../components/VideoCard/videoCard";

const Home = () => {
  return (
    <div className="p-4 bg-black/95 w-full ">
      <div className="flex  flex-wrap overflow-hidden gap-4 w-full  ">
        {videoData.map((video, i) => (
          <VideoCard key={i} data={video} />
        ))}{" "}
      </div>
    </div>
  );
};

export default Home;

const videoData = [
  {
    thumbnail:
      "https://images.pexels.com/photos/20392251/pexels-photo-20392251/free-photo-of-a-brown-butterfly-sitting-on-a-leaf-with-green-leaves.jpeg",
    title: " Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    profilePic: "/profile.jpg",
    channel: "Arnau Ros",
    channelLink: "/",
    views: 100000,
    uploadTime: "18 hours ago",
    videoLink: "/",
  },
  {
    thumbnail:
      "https://images.pexels.com/photos/20392251/pexels-photo-20392251/free-photo-of-a-brown-butterfly-sitting-on-a-leaf-with-green-leaves.jpeg",
    title: " Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    profilePic: "/profile.jpg",
    channel: "Arnau Ros",
    channelLink: "/",
    views: 100000,
    uploadTime: "18 hours ago",
    videoLink: "/",
  },
  {
    thumbnail:
      "https://images.pexels.com/photos/20392251/pexels-photo-20392251/free-photo-of-a-brown-butterfly-sitting-on-a-leaf-with-green-leaves.jpeg",
    title: " Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    profilePic: "/profile.jpg",
    channel: "Arnau Ros",
    channelLink: "/",
    views: 100000,
    uploadTime: "18 hours ago",
    videoLink: "/",
  },
  {
    thumbnail:
      "https://images.pexels.com/photos/20392251/pexels-photo-20392251/free-photo-of-a-brown-butterfly-sitting-on-a-leaf-with-green-leaves.jpeg",
    title: " Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    profilePic: "/profile.jpg",
    channel: "Arnau Ros",
    channelLink: "/",
    views: 100000,
    uploadTime: "18 hours ago",
    videoLink: "/",
  },
  {
    thumbnail:
      "https://images.pexels.com/photos/20392251/pexels-photo-20392251/free-photo-of-a-brown-butterfly-sitting-on-a-leaf-with-green-leaves.jpeg",
    title: " Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    profilePic: "/profile.jpg",
    channel: "Arnau Ros",
    channelLink: "/",
    views: 100000,
    uploadTime: "18 hours ago",
    videoLink: "/",
  },
];
