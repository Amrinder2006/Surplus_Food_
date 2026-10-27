import { Router } from "express";
import jwtverify from "../middlewares/auth.middleware.js";
import receivercheck from "../middlewares/receiver.middleware.js";
import {
  createreport,
  fetchreports,
  fetchreportbyid,
  reportreview,
} from "../controllers/report.controller.js";
import admincheck from "../middlewares/admincheck.middleware.js";

const router = Router();

router.route("/fetch").get(jwtverify, admincheck, fetchreports);
router.route("/fetch/review/:id").patch(jwtverify, admincheck, reportreview);
router.route("/fetch/:id").get(jwtverify, admincheck, fetchreportbyid);
router.route("/:id").post(jwtverify, receivercheck, createreport);

export default router;
