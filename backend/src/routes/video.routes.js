import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public reads — anyone can watch. Everything below verifyJWT needs login.
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

router.use(verifyJWT); // Apply verifyJWT middleware to all routes below

router.route("/").post(publishAVideo);

router
  .route("/:videoId")
  .delete(deleteVideo)
  .patch(updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
