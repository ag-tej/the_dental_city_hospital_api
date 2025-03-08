import mongoose, { Schema } from "mongoose";

const mailingListSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MailingList = mongoose.model("MailingList", mailingListSchema);
