import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  deleteVideoFromCloudinary,
  getVideoDurationFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const queryOptions = {};

  if (query) {
    queryOptions.$text = { $search: query };
  }

  if (userId) {
    queryOptions.owner = userId;
  }

  const sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const skip = (page - 1) * limit;

  const videos = await Video.find(queryOptions)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // Files go straight from the browser to Cloudinary (unsigned preset),
  // because serverless bodies cap at ~4.5MB. The client POSTs the
  // resulting URLs + duration here as JSON.
  const { title, description, videoFile, thumbnail, duration } = req.body || {};

  if (!title?.trim()) {
    throw new ApiError(400, "Give your premiere a title.");
  }
  if (!videoFile) {
    throw new ApiError(400, "Upload the video file first.");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Add a thumbnail (upload one or use an auto frame).");
  }

  let length = Math.floor(Number(duration) || 0);
  if (!length) {
    try {
      length = Math.floor((await getVideoDurationFromCloudinary(videoFile)) || 0);
    } catch {
      length = 0;
    }
  }

  const created = await Video.create({
    title: title.trim(),
    description: String(description || "").trim(),
    videoFile,
    thumbnail,
    duration: length,
    owner: req.user._id,
  });
  await created.populate("owner", "fullName username avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, created, "Premiere published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Every watch counts, then serve the doc with live counters.
  const existedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "fullName username avatar");

  if (!existedVideo) {
    throw new ApiError(400, "Video not found");
  }

  const { Like } = await import("../models/like.model.js");
  const { Comment } = await import("../models/comment.model.js");
  const [likesCount, commentsCount] = await Promise.all([
    Like.countDocuments({ video: videoId }),
    Comment.countDocuments({ video: videoId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...existedVideo.toObject(), likesCount, commentsCount },
      "Video Fetched successfully"
    )
  );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body || {};

  if (![title?.trim(), description?.trim()].every(Boolean)) {
    throw new ApiError(400, "Title and description are required.");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId!");
  }

  const oldVideoDetails = await Video.findById(videoId);

  if (!oldVideoDetails) {
    throw new ApiError(404, "Video not found!");
  }
  if (oldVideoDetails.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own premieres.");
  }

  // Only replace the poster when the client sends a new one — the old
  // code read req.body itself (always truthy) and wiped Cloudinary
  // thumbnails on every edit.
  if (thumbnail && thumbnail !== oldVideoDetails.thumbnail) {
    try {
      await deleteImageFromCloudinary(oldVideoDetails.thumbnail);
    } catch (error) {
      console.error("Error deleting thumbnail from Cloudinary:", error.message);
    }
  }

  const updateFields = {
    title: title.trim(),
    description: description.trim(),
  };

  if (thumbnail) {
    updateFields.thumbnail = thumbnail;
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, {
    new: true,
  }).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own premieres.");
  }

  await Video.findByIdAndDelete(videoId);

  if (video.videoFile) {
    try {
      await deleteVideoFromCloudinary(video.videoFile);
    } catch (error) {
      console.error("Error deleting video from Cloudinary:", error.message);
    }
  }
  if (video.thumbnail) {
    try {
      await deleteImageFromCloudinary(video.thumbnail);
    } catch (error) {
      console.error(
        "Error deleting thumbnail from Cloudinary:",
        error.message
      );
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only change your own premieres.");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video.isPublished,
        "Toggle public status successfully"
      )
    );
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
