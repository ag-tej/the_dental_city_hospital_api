import mongoose, { Schema } from "mongoose";

const jobApplicationSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    applied_position: {
      type: String,
      required: true,
    },
    earliest_start_date: {
      type: Date,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    other_document: {
      type: String,
    },
    read_status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index(
  { fullname: 1, email: 1, phone: 1, applied_position: 1 },
  { unique: true }
);

export const JobApplication = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
