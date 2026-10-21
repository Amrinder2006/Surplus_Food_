import { Router } from "express";
import jwtverify from "../middlewares/auth.middleware.js";
import donorcheck from "../middlewares/donor.middleware.js";
import {
  createdonation,
  fetchdonationbyid,
  fetchdonations,
  updatedonation,
  cancelDonations,
} from "../controllers/donation.controller.js";
import receivercheck from "../middlewares/receiver.middleware.js";
import {
  reservedonation,
  cancelreservation,
} from "../controllers/receiver.controller.js";

const router = Router();
router.route("/").post(jwtverify, donorcheck, createdonation);
router.route("/").get(fetchdonations);
router.route("/:id").get(fetchdonationbyid);
router.route("/update/:id").patch(jwtverify, donorcheck, updatedonation);
router.route("/cancel/:id").patch(jwtverify, donorcheck, cancelDonations);
router.route("/reserve/:id").patch(jwtverify, receivercheck, reservedonation);
router
  .route("/cancelreserve/:id")
  .patch(jwtverify, receivercheck, cancelreservation);
export default router;
