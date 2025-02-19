import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Tweet
const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  if (!tweet) {
    throw new ApiError(400, "Tweet body is empty!");
  }

  const createdTweet = await Tweet.create({
    content: tweet,
    owner: req.user._id,
  });

  res.status(201).json(new ApiResponse(200, createdTweet, "Tweet added successfully"));
});

// Get User Tweets
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Populate user data with tweet retrieval
  const tweets = await Tweet.find({ owner: userId }).populate("owner", "userName avatar fullName");

  if (!tweets || tweets.length === 0) {
    throw new ApiError(404, "No tweets found for this user");
  }

  res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

// Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content cannot be empty");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

// Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  res.status(200).json(new ApiResponse(200, { message: "Tweet deleted successfully" }));
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};
