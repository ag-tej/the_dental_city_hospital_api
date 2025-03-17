import mongoose, { Schema } from "mongoose";

const slotSchema = new Schema({
  startTime: { type: String, required: true }, // e.g. "10:00"
  endTime: { type: String, required: true }, // e.g. "10:30"
  status: {
    type: String,
    enum: ["Available", "Pending", "Confirmed"],
    default: "Available",
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    default: null,
  },
});

const doctorScheduleSchema = new Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    scheduleSlots: [slotSchema], // Auto-generated time slots
  },
  {
    timestamps: true,
  }
);

doctorScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export const DoctorSchedule = mongoose.model(
  "DoctorSchedule",
  doctorScheduleSchema
);
