import express from "express";
import { verifyJWT} from "../middlewares/auth.middleware.js";
import {
  getUserSubscriptions,
  getChannelSubscribers,
  toggleSubscription,
  getLatestVideoFromSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.use(verifyJWT);

router
  .route("/c/:channelId")
  .post(toggleSubscription)
  .get(getChannelSubscribers);

router.route("/u/:subscriberId").get(getUserSubscriptions);

router
  .route("/u/:subscriberId/latest")
  .get(getLatestVideoFromSubscribedChannels);

export default router;