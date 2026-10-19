import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { donations } from "../../constants.js";
const donorcheck = asyncHandler((req, res, next) => {
  const user = req.user;
  if (!user) throw new ApiError(400, "No User found");
  if (!donations.includes(user.role))
    throw new ApiError(400, "Unauthorized or Invalid User");

  next();
});

export default donorcheck;
