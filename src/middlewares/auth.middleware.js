import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  partitioned: true,
};

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token)
      return res
        .status(401)
        .clearCookie("accessToken", cookieOptions)
        .json(new ApiResponse(401, {}, "Unauthorized request"));
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken._id === process.env.ID) return next();
    else
      return res
        .status(401)
        .clearCookie("accessToken", cookieOptions)
        .json(new ApiResponse(401, {}, "Invalid access token"));
  } catch (error) {
    return res
      .status(401)
      .clearCookie("accessToken", cookieOptions)
      .json(new ApiResponse(401, {}, "Invalid access token"));
  }
};
