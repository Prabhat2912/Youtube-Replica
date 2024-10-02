import React, { useEffect } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuth,
  checkAuthOnRefresh,
} from "./Redux/Features/Auth/AuthSlice";
import SignUp from "./components/Signup/signUp";

const ProtectedRoute = ({ element }) => {
  const { isLogin } = useSelector(selectAuth);

  if (!isLogin) {
    return <Navigate to="/login" replace />;
    authenticated;
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

  return <RouterProvider router={router} />;
}

export default App;
