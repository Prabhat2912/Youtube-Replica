import React from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";

const Dashboard = () => {
  const authState = useSelector(selectAuth);
  console.log(authState);
  return <div>Dashboard</div>;
};

export default Dashboard;
