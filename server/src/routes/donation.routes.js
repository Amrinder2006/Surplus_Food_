import { Router } from "express";
import jwtverify from "../middlewares/auth.middleware.js";
import donorcheck from "../middlewares/donor.middleware.js";
import {
  createdonation,
  fetchdonationbyid,
  fetchdonations,
} from "../controllers/donation.controller.js";

const router = Router();
router.route("/").post(jwtverify, donorcheck, createdonation);
router.route("/").get(fetchdonations);
router.route("/:id").get(fetchdonationbyid);

export default router;
