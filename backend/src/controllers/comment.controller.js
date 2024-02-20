import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const queryOptions = { video: videoId };

  const skip = (page - 1) * limit;

  const comments = await Comment.find(queryOptions)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetcched success"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const userId = req.user._id;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID not provided");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(403, "Comment content cannot be empty");
  }

  await Comment.create({ content, video: videoId, owner: userId });

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, totalComments, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;

  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "No comment found");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(403, "Field empty ");
  }

  const commenta = await Comment.findById(commentId);

  commenta.content = content;
  commenta.save();

  return res
    .status(200)
    .json(new ApiResponse(200, commenta, "Comment updated success"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "Comment not found");
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(new ApiResponse(200, "Comment deleted success"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
