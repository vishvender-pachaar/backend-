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
    if(!userId){
        return next(
            new ApiError(400,"userId is reqiured")
        );
    }
    if (!isValidObjectId(userId)) {
        return next(new ApiError(400, "Invalid user Id"));
      }
    
      if (!authorizedOwner(userId, req)) {
        return next(
          new ApiError(401, "unauthorized access, you don't own this user")
        );
      }
   // Fetch playlists for the given user
   const playlists = await Playlist.find({ owner: userId })
   .populate("owner", "fullName userName") // Populate user details
   .populate("videos", "title thumbnail duration"); // Populate videos in the playlist

 if (!playlists || playlists.length === 0) {
   return next(new ApiError(404, "No playlists found for this user."));
 }

 // Respond with the playlists
 res
   .status(200)
   .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

  // Validate playlist ID
  if (!playlistId) {
    return next(new ApiError(400, "Playlist ID is required"));
  }

  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid Playlist ID"));
  }

  // Find playlist by ID
  const playlist = await Playlist.findById(playlistId)
    .populate("owner", "fullName userName") // Populate owner details
    .populate("videos", "title thumbnail duration"); // Populate videos in the playlist

  if (!playlist) {
    return next(new ApiError(404, "Playlist not found"));
  }

  // Respond with the playlist
  res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

  // Validate playlist ID
  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist ID"));
  }

  // Validate video ID
  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  // Check if the playlist exists
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return next(new ApiError(404, "Playlist not found"));
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  // Check if the video is already in the playlist
  if (playlist.videos.includes(videoId)) {
    return next(new ApiError(400, "Video already exists in the playlist"));
  }

  // Add the video to the playlist
  playlist.videos.push(videoId);
  await playlist.save();

  // Respond with the updated playlist
  res.status(200).json(
    new ApiResponse(200, playlist, "Video added to playlist successfully")
  );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // Validate playlist ID
  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist ID"));
  }

  // Validate video ID
  if (!isValidObjectId(videoId)) {
    return next(new ApiError(400, "Invalid video ID"));
  }

  // Check if the playlist exists
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return next(new ApiError(404, "Playlist not found"));
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ApiError(404, "Video not found"));
  }

  playlist.videos.pull(videoId);
  await playlist.save();

  // Respond with the updated playlist
  res.status(200).json(
    new ApiResponse(200, playlist, "Video removed from playlist successfully")
  );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    
  if (!playlistId) {
    return next(new ApiError(400, "Playlist Id is missing"));
  }

  if (!isValidObjectId(playlistId)) {
    return next(new ApiError(400, "Invalid playlist Id"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return next(new ApiError(400, "Playlist doesn't exist in DB"));
  }

  if (!authorizedOwner(playlist.owner, req)) {
    return next(new ApiError(401, "unauthorized access"));
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    return next(
      new ApiError(500, "Something went wrong while deleting playlist")
    );
  }

  console.log(deletedPlaylist);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId) {
        return next(new ApiError(400, "Playlist Id is missing"));
      }
    
      if (!isValidObjectId(playlistId)) {
        return next(new ApiError(400, "Invalid playlist Id"));
      }
    
      const playlist = await Playlist.findById(playlistId);
    
      if (!playlist) {
        return next(new ApiError(400, "Playlist doesn't exist in DB"));
      }
    
      if (!authorizedOwner(playlist.owner, req)) {
        return next(new ApiError(401, "unauthorized access"));
      }
    
      if (!(name || description)) {
        return next(
          new ApiError(400, "Please provide at least one field to update")
        );
      }
    
      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          name,
          description,
        },
        { new: true }
      )
    
      if (!updatedPlaylist) {
        return next
          new ApiError(500, "Something went wrong while updating playlist") 
      }
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}