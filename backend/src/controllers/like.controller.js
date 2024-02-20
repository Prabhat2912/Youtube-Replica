import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!videoId) {
    throw new ApiError(400, "Video ID is missing");
  }

  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  let totalLikes;
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    totalLikes = await Like.countDocuments({ video: videoId });
  } else {
    await Like.create({ video: videoId, likedBy: userId });
    totalLikes = await Like.countDocuments({ video: videoId });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, totalLikes, "Likes toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;

  if (!commentId) {
    throw new ApiError(400, "Comment not found");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const existedLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  let totalLikes;

  if (existedLike) {
    await Like.findByIdAndDelete(existedLike._id);
    totalLikes = await Like.countDocuments({ comment: commentId });
  } else {
    await Like.create({ comment: commentId, likedBy: userId });
    totalLikes = await Like.countDocuments({ comment: commentId });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, totalLikes, "Likes toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;

  if (!tweetId) {
    throw new ApiError(400, "tweet not found");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const existedLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  let totalLikes;

  if (existedLike) {
    await Like.findByIdAndDelete(existedLike._id);
    totalLikes = await Like.countDocuments({ tweet: tweetId });
  } else {
    await Like.create({ tweet: tweetId, likedBy: userId });
    totalLikes = await Like.countDocuments({ tweet: tweetId });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, totalLikes, "Likes toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "unauthorized Access");
  }

  const userLikes = await Like.find({ likedBy: userId });

  const videoIds = userLikes.map((like) => like.video);

  const videos = await Video.find({ _id: { $in: videoIds } });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All liked videos fetched success"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
