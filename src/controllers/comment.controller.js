import mongoose, { isValidObjectId }  from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import { Video } from "../models/video.model.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    if (!videoId) {
      return next(new ApiError(400, "video id is missing."));
    }
  
    if (!isValidObjectId(videoId)) {
      return next(new ApiError(400, "invalid video id"));
    }
  
    const video = await Video.findById(videoId);
    if (!video) {
      return next(new ApiError(500, `video with id ${videoId} does not exist`));
    }
  
    const pipeline = [
      { $match: { video: new mongoose.Types.ObjectId(videoId) } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                _id: 0,
                userName: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ];
  
    // do not use await here because we need to pass the filter created in this step to aggregatePaginate()
    const comments = Comment.aggregate(pipeline);
  
    if (!comments) {
      return next(new ApiError(404, "no comments found fot this video"));
    }
    // console.log(comments);
  
   // Pagination options
    const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: true,
  };
  
    const response = await Comment.aggregatePaginate(comments, options);
  
    // console.log("\n pagination output: \n", response);
  
    res.status(200).json(
      new ApiResponse(
        200,
        {
          totaldocs: response.totalDocs,
          count: response.docs?.length,
          totalPages: response.totalPages,
          currentPage: response.page,
          nextPage: response.nextPage,
          prevPage: response.prevPage,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage,
          pagingCounter: response.pagingCounter,
          videoComments: response.docs.reverse(),
        },
        "video comments fetched successfully"
      )
    );
  });
  
  const addComment = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    const { comment } = req.body;
  
    //console.log(videoId, comment);
  
    if (!videoId) {
      return next(new ApiError(400, "video id is missing."));
    }
  
    if (!isValidObjectId(videoId)) {
      return next(new ApiError(400, "invalid video id"));
    }
  
    const video = await Video.findById(videoId);
    if (!video) {
      return next(new ApiError(500, `video with id ${videoId} does not exist`));
    }
  
    if (!comment) {
      return next(new ApiError(400, "comment body is empty!"));
    }
  
    // add comment document in DB
    const createdCommentDoc = await Comment.create({
      content: comment,
      owner: req.user._id,
      video: videoId,
    });
  
    console.log(createdCommentDoc);
  
    res
      .status(201)
      .json(
        new ApiResponse(200, createdCommentDoc, "comment added successfully")
      );
  });

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body; // Assuming 'content' is the field you want to update
  
    if (!content) {
      return next(new ApiError(400, "Content cannot be empty"));
    }
  
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId },  // Query to find the comment by ID
      { $set: { content } }, // Update operation to set new content
      { new: true }  // Return the updated document
    );
  
    if (!updatedComment) {
      return next(new ApiError(404, "Comment not found"));
    }
  
    res.status(200).json(
      new ApiResponse(200, updatedComment, "Comment updated successfully")
    );

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
      return next(new ApiError(400, "Comment ID is required"));
    }
  
    const result = await Comment.deleteOne({ _id: commentId });
  
    if (result.deletedCount === 0) {
      return next(new ApiError(404, "Comment not found"));
    }
  
    res.status(200).json(new ApiResponse(200, { message: "Comment deleted successfully" }));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }