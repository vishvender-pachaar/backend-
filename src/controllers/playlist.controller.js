import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


export const authorizedOwner = (userId, req) => {
    console.log({ userId });
  
    return userId.toString() === req.user._id.toString();
  };
  
  const createPlaylist = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
  
    if (!name || !description) {
      return next(new ApiError(400, "name and description are required fields"));
    }
  
    // create playlist in DB
  
    const createdPlaylist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });
  
    if (!createPlaylist) {
      return next(
        new ApiError(500, "Something went wrong while creating playlist")
      );
    }
  
    res
      .status(201)
      .json(
        new ApiResponse(200, createdPlaylist, "playlist created successfully")
      );
  });

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}