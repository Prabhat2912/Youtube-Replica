import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getLatestTweets,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Reading shouts is public; writing needs login.
router.route("/latest").get(getLatestTweets);
router.route("/user/:userId").get(getUserTweets);

router.use(verifyJWT); // Apply verifyJWT middleware to all routes below

router.route("/").post(createTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
