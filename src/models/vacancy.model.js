import mongoose, { Schema } from "mongoose";

const vacancySchema = new Schema(
  {
    job_title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    last_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vacancy = mongoose.model("Vacancy", vacancySchema);
