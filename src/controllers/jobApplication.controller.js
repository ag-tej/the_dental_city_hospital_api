import { JobApplication } from "../models/jobApplication.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFiles, deleteFiles } from "../utils/cloudinary.js";

export const getJobApplication = asyncHandler(async (req, res) => {
  try {
    const jobApplications = await JobApplication.find();
    if (!jobApplications) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No job applications found."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobApplications,
          "Job applications fetched successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch job applications."));
  }
});

export const createJobApplication = asyncHandler(async (req, res) => {
  const { fullname, email, phone, applied_position, earliest_start_date } =
    req.body;
  const { resume, other_document } = req.files;
  if (
    !fullname ||
    !email ||
    !phone ||
    !applied_position ||
    !earliest_start_date ||
    !resume
  ) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "All fields except other document are required."
        )
      );
  }
  const existingApplication = await JobApplication.findOne({
    fullname,
    email,
    phone,
    applied_position,
  });
  if (existingApplication) {
    return res
      .status(409)
      .json(
        new ApiResponse(409, {}, "This application has already been submitted.")
      );
  }
  let resumeUrl, otherDocumentUrl;
  if (req.files) {
    if (resume) {
      const { successfulUploads, failedUploads } = await uploadFiles([
        resume[0],
      ]);
      if (failedUploads.length > 0 || successfulUploads.length === 0) {
        return res
          .status(500)
          .json(new ApiResponse(500, {}, "Resume upload failed."));
      }
      resumeUrl = successfulUploads[0];
    }
    if (other_document) {
      const { successfulUploads, failedUploads } = await uploadFiles([
        other_document[0],
      ]);
      if (failedUploads.length > 0 || successfulUploads.length === 0) {
        return res
          .status(500)
          .json(new ApiResponse(500, {}, "Other document upload failed."));
      }
      otherDocumentUrl = successfulUploads[0];
    }
  }
  try {
    const jobApplicationData = new JobApplication({
      fullname,
      email,
      phone,
      applied_position,
      earliest_start_date,
      resume: resumeUrl,
      other_document: otherDocumentUrl,
    });
    const jobApplication = await JobApplication.create(jobApplicationData);
    if (!jobApplication) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to submit job application."));
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, {}, "Job application submitted successfully.")
      );
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            {},
            "This application has already been submitted."
          )
        );
    }
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to submit job application."));
  }
});

export const deleteJobApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const jobApplication = await JobApplication.findById(id);
    if (!jobApplication) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Job application not found."));
    }
    if (jobApplication.resume) {
      const publicId = jobApplication.resume.split("/").pop().split(".")[0];
      await deleteFiles([publicId]);
    }
    if (jobApplication.other_document) {
      const publicId = jobApplication.other_document
        .split("/")
        .pop()
        .split(".")[0];
      await deleteFiles([publicId]);
    }
    const deletedJobApplication = await JobApplication.findByIdAndDelete(id);
    if (!deletedJobApplication) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to delete job."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedJobApplication,
          "Job application deleted successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete job application."));
  }
});

export const changeReadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const jobApplication = await JobApplication.findById(id);
    if (!jobApplication) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Job application not found."));
    }
    // Toggle the read status (if it's true, set to false; if false, set to true)
    jobApplication.read_status = !jobApplication.read_status;
    await jobApplication.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobApplication,
          `Read status updated to ${
            jobApplication.read_status ? "read" : "unread"
          } successfully.`
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update read status."));
  }
});
