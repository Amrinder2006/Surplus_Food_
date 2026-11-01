import { Router } from "express";
import jwtverify from "../middlewares/auth.middleware.js";

import {
  fetchnotification,
  fetchunreadnotification,
  markasread,
  markallread,
} from "../controllers/notification.controller.js";

const router = Router();

// Fetch all notifications
router.route("/").get(jwtverify, fetchnotification);

// Fetch unread notification count
router.route("/unread-count").get(jwtverify, fetchunreadnotification);

// Mark one notification as read
router.route("/:id/read").patch(jwtverify, markasread);

// Mark all notifications as read
router.route("/read-all").patch(jwtverify, markallread);

export default router;
