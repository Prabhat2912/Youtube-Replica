import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  try {
    const userId = req.user._id;

    if (!userId) {
      throw new ApiError(400, "Error at getting user in dashboard");
    }

    console.log(userId);

    const totalVideoViews = await Video.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $group: {
          _id: null,
          views: {
            $sum: "$views",
          },
        },
      },
    ]);

    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });

    const totalVideos = await Video.countDocuments({ owner: userId });
    const totalLikes = await Like.countDocuments({
      video: { $in: await Video.find({ owner: userId }, "_id") },
    });

    const channelStats = {
      totalVideoViews:
        totalVideoViews.length > 0 ? totalVideoViews[0].views : 0,
      totalSubscribers,
      totalVideos,
      totalLikes,
    };
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelStats,
          "Channel stats retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error at dashboard", error);
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Unauthorized access");
  }

  const videos = await Video.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
