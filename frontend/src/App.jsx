import React from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/home";
import Dashboard from "./pages/Dashboard/dashboard";
import Profile from "./pages/Profile/profile";
import SearchView from "./pages/SearchView/searchView";
import VideoPlayer from "./pages/Video-Player/videoPlayer";
import Login from "./components/Login/Login";
import { useSelector } from "react-redux";
import { selectAuth } from "./Redux/Features/Auth/AuthSlice";
import SignUp from "./components/Signup/signUp";

const isAuthenticated = () => {
  const authState = useSelector(selectAuth);
  const isLoggedIn = authState.isLogin;
  return isLoggedIn;
};

const ProtectedRoute = ({ element, path }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

const routes = (
  <Route>
    <Route path="signup" element={<SignUp />} />
    <Route path="login" element={<Login />} />
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Home />} />

      <Route
        path="dashboard"
        element={<ProtectedRoute element={<Dashboard />} />}
      />
      <Route
        path="profile"
        element={<ProtectedRoute element={<Profile />} />}
      />
      <Route
        path="search-view"
        element={<ProtectedRoute element={<SearchView />} />}
      />
      <Route path="video" element={<VideoPlayer />} />

      <Route path="*" element={<div>Not Found</div>} />
    </Route>
  </Route>
);

const router = createBrowserRouter(createRoutesFromElements(routes));

function App() {
  return <RouterProvider router={router} />;
}

export default App;
