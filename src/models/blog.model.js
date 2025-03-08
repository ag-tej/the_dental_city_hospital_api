import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    cover_image: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    view_count: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model("Blog", blogSchema);
