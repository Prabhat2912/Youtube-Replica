import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteVideoFromCloudinary,
  uploadOnCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;

  const queryOptions = {};

  if (query) {
    queryOptions.$text = { $search: query };
  }

  if (userId) {
    queryOptions.owner = userId;
  }

  let videos;

  if (sortBy && sortType) {
    const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };
    videos = await Video.find(queryOptions).sort(sortOptions);
  } else {
    videos = await Video.find(queryOptions);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoLocalPath = req.files?.videoFile[0]?.path;

  console.log(videoLocalPath);

  if (!videoLocalPath) {
    throw new ApiError(400, "No videos found");
  }

  const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

  if (!uploadedVideo) {
    throw new ApiError(500, "Failed to upload video to Cloudinary");
  }

  const thumbnailLocal = req.files?.thumbnail[0]?.path;
  console.log(thumbnailLocal);

  if (!thumbnailLocal) {
    throw new ApiError(400, "No thumbnail found");
  }
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocal);

  if (!uploadedThumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
  }

  const duration = parseInt(uploadedVideo.duration);

  const video = new Video({
    title,
    description,
    videoFile: uploadedVideo.secure_url,
    thumbnail: uploadedThumbnail.secure_url,
    duration,
    owner: req.user._id,
  });
  await video.save();

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video Published Successfully"));

  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const existedVideo = await Video.findById(videoId);

  if (!existedVideo) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, existedVideo, "Video Fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;

  if (![title, description].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId!");
  }

  const thumbnailLocalPath = req.file?.path;

  const oldVideoDetails = await Video.findById(videoId);

  if (!oldVideoDetails) {
    throw new ApiError(404, "Video not found!");
  }

  if (thumbnailLocalPath) {
    await deleteImageFromCloudinary(oldVideoDetails.thumbnail);
  }

  let thumbnail;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  }

  if (!thumbnail && thumbnailLocalPath) {
    throw new ApiError(500, "Failed to upload thumbnail!, please try again");
  }

  const updateFields = {
    title,
    description,
  };

  if (thumbnail) {
    updateFields.thumbnail = thumbnail.secure_url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    const video = await Video.findByIdAndDelete(videoId);
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
      .json(new ApiResponse(200, "Video deleted succesfully "));
  } catch (error) {
    return res.json(error);
  }

  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Toggle public status successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
