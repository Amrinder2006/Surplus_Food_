import ApiError from "./ApiError";

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, Response, next);
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  };
};

export default asyncHandler;
