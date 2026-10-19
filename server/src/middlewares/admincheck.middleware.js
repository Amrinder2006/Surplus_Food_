import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Admin } from "../../constants.js";
const admincheck = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(401, "No User Found");
  if (user.role !== Admin) {
    throw new ApiError(403, "Unauthorized User Not Allowed");
  }
  next();
});

export default admincheck;
