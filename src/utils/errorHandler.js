import { ApiResponse } from "./apiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = 500;
  const message = "Internal Server Error";
  res.status(statusCode).json(new ApiResponse(statusCode, {}, message));
};

export default errorHandler;
