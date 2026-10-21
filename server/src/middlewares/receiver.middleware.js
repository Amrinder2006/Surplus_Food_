import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { receivers } from "../../constants.js";

const receivercheck = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!receivers.includes(user.role))
    throw new ApiError(401, "Not valid role of receiver");

  next();
});

export default receivercheck;
