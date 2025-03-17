import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorSchedule",
      required: true,
    },
    scheduleSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
