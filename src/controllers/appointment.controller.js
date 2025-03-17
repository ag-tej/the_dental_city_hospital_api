import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTelegramMessage } from "../utils/telegramHelper.js";

// Helper function to parse the time string into a Date object
const parseTime = (timeString, baseDate) => {
  // Split the time string into hours, minutes, and AM/PM
  const [time, period] = timeString.split(" "); // e.g., "10:00 AM"
  const [hour, minute] = time.split(":").map(Number);
  // Convert to 24-hour format
  let hours24 = hour;
  if (period === "PM" && hour !== 12) {
    hours24 += 12; // Convert PM to 24-hour format
  } else if (period === "AM" && hour === 12) {
    hours24 = 0; // Midnight case
  }
  // Set the date's hours and minutes
  baseDate.setHours(hours24, minute, 0, 0); // Set hours, minutes, and reset seconds and milliseconds
  return baseDate;
};

export const getAppointments = asyncHandler(async (req, res) => {
  try {
    // Fetch doctor schedules with 'Pending' slot status
    const doctorSchedules = await DoctorSchedule.find({
      "scheduleSlots.status": "Pending",
    })
      .populate({
        path: "doctorId",
        select: "name department",
      })
      .populate({
        path: "scheduleSlots.appointmentId",
      });
    if (!doctorSchedules) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, {}, "Failed to fetch pending appointments.")
        );
    }
    const formattedAppointments = [];
    // Loop through doctor schedules and collect the pending appointments
    doctorSchedules.forEach((schedule) => {
      schedule.scheduleSlots.forEach((slot) => {
        if (slot.status === "Pending") {
          const appointment = slot.appointmentId;
          const appointmentDate = new Date(schedule.date);
          const formattedDate = parseTime(slot.startTime, appointmentDate);
          const formattedDateStr = formattedDate.toLocaleString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          formattedAppointments.push({
            appointmentId: appointment._id,
            fullname: appointment.fullname,
            gender: appointment.gender,
            age: appointment.age,
            phone: appointment.phone,
            message: appointment.message,
            status: slot.status,
            doctorName: schedule.doctorId.name,
            doctorDepartment: schedule.doctorId.department,
            appointmentDate: formattedDateStr,
          });
        }
      });
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { appointments: formattedAppointments },
          "Pending appointments fetched successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch pending appointments."));
  }
});

export const createAppointment = asyncHandler(async (req, res) => {
  const {
    fullname,
    gender,
    age,
    phone,
    message,
    doctorId,
    doctorScheduleId,
    scheduleSlotId,
  } = req.body;
  if (
    !fullname ||
    !gender ||
    !age ||
    !phone ||
    !message ||
    !doctorId ||
    !doctorScheduleId ||
    !scheduleSlotId
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  try {
    const appointmentData = new Appointment({
      fullname,
      gender,
      age,
      phone,
      message,
      doctorId,
      doctorScheduleId,
      scheduleSlotId,
    });
    // Retrieve doctor
    const doctor = await Doctor.findById(doctorId);
    // Retrieve the doctor's schedule and the corresponding slot
    const doctorSchedule = await DoctorSchedule.findById(doctorScheduleId);
    const slot = doctorSchedule.scheduleSlots.find(
      (slot) => slot._id.toString() === scheduleSlotId
    );
    if (slot.status === "Available") {
      const appointment = await Appointment.create(appointmentData);
      if (!appointment) {
        return res
          .status(500)
          .json(new ApiResponse(500, {}, "Failed to create appointment."));
      }
      // Update slot status to 'Pending' and set the appointmentId
      slot.status = "Pending";
      slot.appointmentId = appointment._id;
      // Save the updated doctor schedule with the modified slot
      await doctorSchedule.save();
    }
    // Format the date and time
    const appointmentDate = new Date(doctorSchedule.date); // Base date from doctor's schedule
    const formattedDate = parseTime(slot.startTime, appointmentDate);
    // Format the appointment date and time (e.g., Friday, 25 March, 2025 10:20 AM)
    const formattedDateStr = formattedDate.toLocaleString("en-US", {
      weekday: "long", // Friday
      day: "numeric", // 25
      month: "long", // March
      year: "numeric", // 2025
      hour: "2-digit", // 10 AM
      minute: "2-digit", // 20
      hour12: true, // AM/PM format
    });
    const telegramMessage = `Dear Admin,\nNew Appointment Request Received!\n\nName: ${fullname}\nPhone: ${phone}\nDoctor: ${doctor.name} (${doctor.department})\nAppointment Date: ${formattedDateStr}\nMessage: ${message}\n\nPlease log in to review the appointment.`;
    await sendTelegramMessage(telegramMessage);
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Appointment created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to create appointment."));
  }
});

export const editAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullname, gender, age, phone, message } = req.body;
  if (!fullname || !gender || !age || !phone || !message) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Appointment not found."));
    }
    appointment.fullname = fullname;
    appointment.gender = gender;
    appointment.age = age;
    appointment.phone = phone;
    appointment.message = message;
    await appointment.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { appointment },
          "Appointment updated successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update the appointment."));
  }
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // Step 1: Find the appointment by ID
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Appointment not found."));
    }
    // Step 2: Find the doctor's schedule associated with the appointment
    const doctorSchedule = await DoctorSchedule.findById(
      appointment.doctorScheduleId
    );
    if (!doctorSchedule) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Doctor's schedule not found."));
    }
    // Step 3: Find the corresponding schedule slot for this appointment
    const slot = doctorSchedule.scheduleSlots.find(
      (slot) => slot._id.toString() === appointment.scheduleSlotId.toString()
    );
    if (!slot) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Schedule slot not found."));
    }
    // Step 4: Set the slot status to 'Available' and remove the appointmentId
    slot.status = "Available";
    slot.appointmentId = null;
    // Save the updated doctor schedule with the modified slot
    await doctorSchedule.save();
    // Step 5: Delete the appointment
    await Appointment.findByIdAndDelete(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Appointment deleted successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete the appointment."));
  }
});

export const confirmStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // Step 1: Find the appointment by ID
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Appointment not found."));
    }
    // Step 2: Find the doctor's schedule associated with the appointment
    const doctorSchedule = await DoctorSchedule.findById(
      appointment.doctorScheduleId
    );
    if (!doctorSchedule) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Doctor's schedule not found."));
    }
    // Step 3: Find the corresponding schedule slot for this appointment
    const slot = doctorSchedule.scheduleSlots.find(
      (slot) => slot._id.toString() === appointment.scheduleSlotId.toString()
    );
    if (!slot) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Schedule slot not found."));
    }
    // Step 4: Set the slot status to 'Confirmed'
    slot.status = "Confirmed";
    // Save the updated doctor schedule with the modified slot
    await doctorSchedule.save();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Appointment confirmed successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to confirm the appointment."));
  }
});
