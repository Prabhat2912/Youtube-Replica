import React, { useEffect } from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Landing from "./pages/Landing/Landing";
import Home from "./pages/Home/home";
import Dashboard from "./pages/Dashboard/dashboard";
import Profile from "./pages/Profile/profile";
import SearchView from "./pages/SearchView/searchView";
import VideoPlayer from "./pages/Video-Player/videoPlayer";
import VerifyOtp from "./pages/VerifyOtp/VerifyOtp";
import Login from "./components/Login/Login";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuth,
  checkAuthOnRefresh,
} from "./Redux/Features/Auth/AuthSlice";
import SignUp from "./components/Signup/signUp";
import { Toaster } from "sonner";

const ProtectedRoute = ({ element }) => {
  const { isLogin } = useSelector(selectAuth);
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

const routes = (
  <Route>
    <Route path="/" element={<Landing />} />
    <Route path="signup" element={<SignUp />} />
    <Route path="login" element={<Login />} />
    <Route path="verify-otp" element={<VerifyOtp />} />
    <Route element={<Layout />}>
      <Route path="home" element={<Home />} />
      <Route
        path="dashboard"
        element={<ProtectedRoute element={<Dashboard />} />}
      />
      <Route
        path="profile"
        element={<ProtectedRoute element={<Profile />} />}
      />
      <Route path="search" element={<SearchView />} />
      {/* legacy alias */}
      <Route path="search-view" element={<SearchView />} />
      <Route path="video/:id" element={<VideoPlayer />} />
      {/* legacy alias */}
      <Route path="video" element={<VideoPlayer />} />
      <Route path="*" element={<div className="p-10 text-center text-slate-500">Nothing here yet — <a className="font-semibold text-orange-600" href="/home">back to feed</a></div>} />
    </Route>
  </Route>
);

// Create Router
const router = createBrowserRouter(createRoutesFromElements(routes));

function App() {
  const dispatch = useDispatch();
  const { isLogin } = useSelector(selectAuth);

  // Check auth state on app load
  useEffect(() => {
    if (!isLogin) {
      dispatch(checkAuthOnRefresh());
    }
  }, [dispatch, isLogin]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
