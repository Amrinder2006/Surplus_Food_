import { Router } from "express";
import jwtverify from "../middlewares/auth.middleware.js";
import admincheck from "../middlewares/admincheck.middleware.js";
import {
  getDashboardStats,
  getdonationbycategory,
  getbycreationdate,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/dash").get(jwtverify, admincheck, getDashboardStats);
router.route("/category").get(jwtverify, admincheck, getdonationbycategory);
router.route("/creation-date").get(jwtverify, admincheck, getbycreationdate);

export default router;
