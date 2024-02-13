import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  if (
    !name ||
    (name.trim() === "" && !description) ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "Both name and description is required");
  }

  const playlist = await Playlist.create({ name, description, owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(401, "User is not given");
  }

  const allPlaylits = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, allPlaylits, "All playlists fetched successfully ")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "45");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const userId = req.user._id;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist or video not provided");
  }

  const playlist = await Playlist.findById(playlistId);

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not Found");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video Added Successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  const userId = req.user._id;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist ID or Video ID not provided");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(
      401,
      "You are not authorized to remove videos from this playlist"
    );
  }

  playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId.toString()
  );

  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID not provided");
  }

  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or you are not the owner");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.json(new ApiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  const userId = req.user._id;

  if (!playlistId) {
    throw new ApiError(404, "Playlist Not found");
  }
  if (!userId) {
    throw new ApiError(401, " Unauthorized");
  }
  if (
    !name ||
    name.trim() === "" ||
    !description ||
    description.trim() === ""
  ) {
    throw new ApiError(403, "Both name and description");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "PLaylist not found");
  }
  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(401, "You can't make changes to this playlist ");
  }

  playlist.name = name;
  playlist.description = description;
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
