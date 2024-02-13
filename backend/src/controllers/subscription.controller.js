import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();
    res.json(new ApiResponse(200, null, "Subscription removed successfully"));
  } else {
    const newSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
    res.json(
      new ApiResponse(200, newSubscription, "Subscription added successfully")
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const userId = req.user._id;
  console.log(subscriberId);
  const subscribers = await Subscription.find({
    channel: subscriberId,
  });
  const totalSubs = await Subscription.countDocuments({
    channel: subscriberId,
  });

  const subdata = {
    subsDetails: subscribers,
    no: totalSubs,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, subdata, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribedTo = await Subscription.find({
    subscriber: channelId,
  });

  const totalSubto = await Subscription.countDocuments({
    subscriber: channelId,
  });

  const subedData = {
    subscribedTo: subscribedTo,
    no: totalSubto,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, subedData, "Subcribed fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
