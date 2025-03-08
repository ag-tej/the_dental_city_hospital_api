import { Testimonial } from "../models/testimonial.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTestimonial = asyncHandler(async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    if (!testimonials) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No testimonials found."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, testimonials, "Testimonials fetched successfully.")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch testimonials."));
  }
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const { client_name, client_message } = req.body;
  if (!client_name || !client_message) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  try {
    const testimonialData = new Testimonial({
      client_name,
      client_message,
    });
    const testimonial = await Testimonial.create(testimonialData);
    if (!testimonial) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to create testimonial."));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Testimonial created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to create testimonial."));
  }
});

export const editTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Testimonial not found."));
  }
  const { client_name, client_message } = req.body;
  if (!client_name || !client_message) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  const updates = { client_name, client_message };
  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    if (!updatedTestimonial) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to update testimonial."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedTestimonial,
          "Testimonial updated successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update testimonial."));
  }
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Testimonial not found."));
  }
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
    if (!deletedTestimonial) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to delete testimonial."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedTestimonial,
          "Testimonial deleted successfully."
        )
      );
  } catch (error) {}
  return res
    .status(500)
    .json(new ApiResponse(500, {}, "Failed to delete testimonial."));
});
