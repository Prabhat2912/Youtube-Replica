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
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Subscriptions from "./pages/Subscriptions/subscriptions";
import { Liked, Library } from "./pages/Library/library";
import Settings from "./pages/Settings/settings";
import Help from "./pages/Help/help";
import Upload from "./pages/Upload/upload";
import Shouts from "./pages/Shouts/shouts";
import Channel from "./pages/Channel/channel";
import PlaylistDetail from "./pages/Library/playlistDetail";
import Login from "./components/Login/Login";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuth,
  checkAuthOnRefresh,
} from "./Redux/Features/Auth/AuthSlice";
import SignUp from "./components/Signup/signUp";
import ErrorBoundary from "./components/ErrorBoundary";
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
    <Route path="forgot-password" element={<ForgotPassword />} />
    <Route path="reset-password" element={<ResetPassword />} />
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
      <Route
        path="subscriptions"
        element={<ProtectedRoute element={<Subscriptions />} />}
      />
      <Route path="liked" element={<ProtectedRoute element={<Liked />} />} />
      <Route path="library" element={<ProtectedRoute element={<Library />} />} />
      <Route path="library/:playlistId" element={<ProtectedRoute element={<PlaylistDetail />} />} />
      <Route path="channel/:username" element={<Channel />} />
      <Route
        path="settings"
        element={<ProtectedRoute element={<Settings />} />}
      />
      <Route path="upload" element={<ProtectedRoute element={<Upload />} />} />
      <Route path="shouts" element={<Shouts />} />
      <Route path="help" element={<Help />} />
      <Route path="search" element={<SearchView />} />
      {/* legacy alias */}
      <Route path="search-view" element={<SearchView />} />
      <Route path="video/:id" element={<VideoPlayer />} />
      {/* legacy alias */}
      <Route path="video" element={<VideoPlayer />} />
      <Route path="*" element={<div className="p-10 text-center text-zinc-500">This reel is blank — <a className="font-bold text-ember" href="/home">back to the program</a></div>} />
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
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </ErrorBoundary>
  );
}

export default App;
