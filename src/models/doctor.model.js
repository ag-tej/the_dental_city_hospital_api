import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    profile_image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    facebook_link: {
      type: String,
    },
    instagram_link: {
      type: String,
    },
    linkedin_link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
