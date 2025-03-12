import { Doctor } from "../models/doctor.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFiles, deleteFiles } from "../utils/cloudinary.js";

export const getDoctor = asyncHandler(async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    if (!doctors) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No doctors found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, doctors, "Doctors fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch doctors."));
  }
});

export const createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    department,
    gender,
    facebook_link,
    instagram_link,
    linkedin_link,
  } = req.body;
  if (!name || !department || !gender) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Name, department and gender are required.")
      );
  }
  let profile_image;
  if (req.file) {
    const { successfulUploads, failedUploads } = await uploadFiles([req.file]);
    if (failedUploads.length > 0 || successfulUploads.length === 0) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Image upload failed."));
    }
    profile_image = successfulUploads[0];
  }
  try {
    const doctorData = new Doctor({
      name,
      department,
      gender,
      profile_image,
      facebook_link,
      instagram_link,
      linkedin_link,
    });
    const doctor = await Doctor.create(doctorData);
    if (!doctor) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to create doctor."));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Doctor created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to create doctor."));
  }
});

export const editDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return res.status(404).json(new ApiResponse(404, {}, "Doctor not found."));
  }
  const {
    name,
    department,
    gender,
    facebook_link,
    instagram_link,
    linkedin_link,
  } = req.body;
  if (!name || !department || !gender) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Name, department and gender are required.")
      );
  }
  let profile_image = doctor.profile_image;
  if (req.file) {
    if (profile_image) {
      const publicId = doctor.profile_image.split("/").pop().split(".")[0];
      await deleteFiles([publicId]);
    }
    const { successfulUploads, failedUploads } = await uploadFiles([req.file]);
    if (failedUploads.length > 0 || successfulUploads.length === 0) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Image upload failed."));
    }
    profile_image = successfulUploads[0];
  }
  const updates = {
    name,
    department,
    gender,
    profile_image,
    facebook_link,
    instagram_link,
    linkedin_link,
  };
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedDoctor) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to update doctor."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Doctor updated successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update doctor."));
  }
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return res.status(404).json(new ApiResponse(404, {}, "Doctor not found."));
  }
  if (doctor.profile_image) {
    const publicId = doctor.profile_image.split("/").pop().split(".")[0];
    await deleteFiles([publicId]);
  }
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (!deletedDoctor) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to delete doctor."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Doctor deleted successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete doctor."));
  }
});
