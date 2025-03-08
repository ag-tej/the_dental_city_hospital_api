import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  partitioned: true,
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Email and password are required"));
  }
  if (email === process.env.EMAIL && password === process.env.PASSWORD) {
    const accessToken = jwt.sign(
      { _id: process.env.ID },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .json(
        new ApiResponse(200, process.env.ID, "User logged in successfully")
      );
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid user credentials"));
  }
});

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
