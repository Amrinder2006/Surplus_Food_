import { Router } from "express";
import {
  registeruser,
  loginuser,
  currentUser,
  changepassword,
  logoutuser,
  refreshaccesstoken,
  admindash,
  updatecredentials,
} from "../controllers/user.controller.js";
import jwtverify from "../middlewares/auth.middleware.js";
import admincheck from "../middlewares/admincheck.middleware.js";
const router = Router();
router.route("/register").post(registeruser);
router.route("/login").post(loginuser);
router.route("/refresh-token").post(refreshaccesstoken);

// Protected Routes
router.route("/logout").post(jwtverify, logoutuser);
router.route("/changepass").post(jwtverify, changepassword);
router.route("/current-user").get(jwtverify, currentUser);
router.route("/admindash").get(jwtverify, admincheck, admindash);
router.route("/update").patch(jwtverify, updatecredentials);

export default router;
