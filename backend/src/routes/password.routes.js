import { Router } from "express";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/password.controller.js";

const router = Router();

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

export default router;
