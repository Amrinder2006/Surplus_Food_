class ApiError extends Error {
  constructor(
    statuscode,
    
    message = "Error Ocuured",
    data = null,
    errors = [],
    stack = "",
  ) {
    super(message);
    ((this.statuscode = statuscode),
      (this.data = data),
      (this.message = message),
      (this.success = false),
      (this.errors = errors));

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace?.(this, ApiError);
    }
  }
}

export default ApiError;
