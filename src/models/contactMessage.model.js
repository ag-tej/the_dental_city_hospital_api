import mongoose, { Schema } from "mongoose";

const contactMessageSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
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

contactMessageSchema.index(
  { fullname: 1, phone: 1, email: 1, message: 1 },
  { unique: true }
);

export const ContactMessage = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);
