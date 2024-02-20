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
    .limit(parseInt(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, video, thumbnail } = req.body;

  // Get paths of uploaded files
  // const videoLocalPath =
  //   req.files["videoFile"] && req.files["videoFile"][0]?.path;

  // const thumbnailLocalPath =
  //   req.files["thumbnail"] && req.files["thumbnail"][0]?.path;

  // Check if files exist
  if (!video) {
    throw new ApiError(400, "No video found");
  }
  if (!thumbnail) {
    throw new ApiError(400, "No thumbnail found");
  }

  // Upload files to Cloudinary
  // const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
  // const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // Check if upload to Cloudinary was successful
  // if (!uploadedVideo || !uploadedThumbnail) {
  //   throw new ApiError(
  //     500,
  //     "Failed to upload video or thumbnail to Cloudinary"
  //   );
  // }

  // Calculate duration if available
  const duration = parseInt(getVideoDurationFromCloudinary(video)) || 0;

  // Create a new video document
  const nvideo = new Video({
    title,
    description,
    videoFile: uploadedVideo.secure_url,
    thumbnail: uploadedThumbnail.secure_url,
    duration,
    owner: req.user._id,
  });

  // Save the video document to the database
  await video.save();

  // Return a success response
  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video Published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id|
  const existedVideo = await Video.findById(videoId);

  if (!existedVideo) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, existedVideo, "Video Fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const { videoId } = req.params;

  if (![title, description].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId!");
  }

  const thumbnail = req.body;

  const oldVideoDetails = await Video.findById(videoId);

  if (!oldVideoDetails) {
    throw new ApiError(404, "Video not found!");
  }

  if (thumbnail) {
    await deleteImageFromCloudinary(oldVideoDetails.thumbnail);
  }

  // if (thumbnailLocalPath) {
  //   thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  // }

  // if (!thumbnail && thumbnailLocalPath) {
  //   throw new ApiError(500, "Failed to upload thumbnail!, please try again");
  // }

  const updateFields = {
    title,
    description,
  };

  if (thumbnail) {
    updateFields.thumbnail = thumbnail;
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
  //TODO: delete video

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
      console.error("Error deleting thumbnail from Cloudinary:", error.message);
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted succesfully "));
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
