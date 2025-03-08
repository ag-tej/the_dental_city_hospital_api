import mongoose, { Schema } from "mongoose";

const testimonialSchema = new Schema(
  {
    client_name: {
      type: String,
      required: true,
    },
    client_message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
