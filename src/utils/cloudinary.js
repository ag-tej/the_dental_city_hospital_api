import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error("No file provided");
    return null;
  }
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "the-dental-city",
    });
    return response.secure_url;
  } catch (error) {
    console.error("Error uploading file to cloudinary:", error);
    return null;
  } finally {
    try {
      if (localFilePath) await fs.promises.unlink(localFilePath);
    } catch (error) {
      console.error("Error deleting local file:", error);
    }
  }
};

const deleteFromCloudinary = async (publicId, resource_type = "image") => {
  if (!publicId) {
    console.error("No file public id provided");
    return null;
  }
  try {
    publicId = "the-dental-city/" + publicId;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });
    return response.result === "ok";
  } catch (error) {
    console.error("Error deleting file from cloudinary:", error);
    return null;
  }
};

// Helper function to upload multiple files
const uploadFiles = async (files) => {
  if (!files || files.length === 0) {
    return { successfulUploads: [], failedUploads: [] };
  }
  const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
  const uploadedFiles = await Promise.allSettled(uploadPromises);
  const successfulUploads = [];
  const failedUploads = [];
  uploadedFiles.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      successfulUploads.push(result.value);
    } else {
      failedUploads.push(files[index].originalname);
    }
  });
  return { successfulUploads, failedUploads };
};

// Helper function to delete multiple files
const deleteFiles = async (publicIds, resource_type = "image") => {
  if (!publicIds || publicIds.length === 0) {
    return { successfulDeletions: [], failedDeletions: [] };
  }
  const deletePromises = publicIds.map((publicId) =>
    deleteFromCloudinary(publicId, resource_type)
  );
  const deletedFiles = await Promise.allSettled(deletePromises);
  const successfulDeletions = [];
  const failedDeletions = [];
  deletedFiles.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      successfulDeletions.push(publicIds[index]);
    } else {
      failedDeletions.push(publicIds[index]);
    }
  });
  return { successfulDeletions, failedDeletions };
};

export { uploadFiles, deleteFiles };
