import { Doctor } from "../models/doctor.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateSlots,
  convertToMinutes,
  convertToTimeStr,
} from "../utils/generateSlots.js";

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  // Parse the date to avoid time discrepancies
  const parsedDate = new Date(date);
  // Get current date and time to compare with the slots
  const currentDateTime = new Date();
  try {
    const doctorSchedule = await DoctorSchedule.findOne({
      doctorId: doctorId,
      date: parsedDate,
    });
    if (!doctorSchedule) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "No schedule found for the given doctor on this date."
          )
        );
    }
    // Helper function to convert time string (e.g. "10:00 AM") into a Date object
    const convertToDate = (timeString, baseDate) => {
      const [time, modifier] = timeString.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) {
        hours += 12; // Convert PM hours to 24-hour format, except for 12 PM which is already correct
      } else if (modifier === "AM" && hours === 12) {
        hours = 0; // Convert 12 AM to midnight (00:00)
      }
      const date = new Date(baseDate); // Create a new Date object based on base date
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0); // Reset seconds to ensure precise comparison
      return date;
    };
    // Filter the scheduleSlots to only return those with status 'Available' and whose start time is greater than the current date and time
    const availableSlots = doctorSchedule.scheduleSlots.filter((slot) => {
      if (slot.status !== "Available") return false;
      // Convert slot's startTime to Date object
      const slotDateTime = convertToDate(slot.startTime, parsedDate);
      // Check if the slot's start time is greater than the current date and time
      return slotDateTime > currentDateTime;
    });
    // Return the doctor schedule id and available slots to the client
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { doctorScheduleId: doctorSchedule._id, slots: availableSlots },
          "Slots fetched successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch slots."));
  }
});

export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id).select("name department");
    const schedules = await DoctorSchedule.find({ doctorId: id })
      .populate("doctorId", "name department")
      .populate({
        path: "scheduleSlots.appointmentId",
      })
      .sort({ date: -1 });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { doctor, schedules },
          "Schedules fetched successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch schedules."));
  }
});

export const createDoctorSchedule = asyncHandler(async (req, res) => {
  const { doctorId, date, sessionDuration, timeSlots } = req.body;
  if (!doctorId || !date || !sessionDuration || !timeSlots.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  const slotArray = [];
  timeSlots.forEach((slot) => {
    const generatedSlots = generateSlots(
      slot.startTime,
      slot.endTime,
      sessionDuration || 30
    );
    slotArray.push(...generatedSlots);
  });
  try {
    let doctorSchedule = await DoctorSchedule.findOne({ doctorId, date });
    if (!doctorSchedule) {
      doctorSchedule = new DoctorSchedule({
        doctorId,
        date,
        scheduleSlots: [], // Initialize scheduleSlots as an empty array
      });
    }
    // Function to check if two time slots overlap
    const isOverlapping = (newSlot, existingSlots) => {
      return existingSlots.some((existingSlot) => {
        return (
          (newSlot.startTime >= existingSlot.startTime &&
            newSlot.startTime < existingSlot.endTime) ||
          (newSlot.endTime > existingSlot.startTime &&
            newSlot.endTime <= existingSlot.endTime) ||
          (newSlot.startTime <= existingSlot.startTime &&
            newSlot.endTime >= existingSlot.endTime)
        );
      });
    };
    // Check each generated slot against existing scheduleSlots
    for (let generatedSlot of slotArray) {
      if (isOverlapping(generatedSlot, doctorSchedule.scheduleSlots)) {
        // If an overlapping slot is found, return a conflict response
        return res
          .status(409)
          .json(
            new ApiResponse(
              409,
              {},
              "One or more slots overlap with existing schedule."
            )
          );
      }
    }
    // Add all generated slots to the schedule (since no overlap was found)
    slotArray.forEach((validSlot) => {
      doctorSchedule.scheduleSlots.push({
        startTime: validSlot.startTime,
        endTime: validSlot.endTime,
      });
    });
    await doctorSchedule.save();
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Doctor schedule created successfully."));
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, {}, "Schedule for this date is already created.")
        );
    }
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to create doctor schedule."));
  }
});

export const editSlot = asyncHandler(async (req, res) => {
  const { doctorScheduleId, scheduleSlotId } = req.params;
  const { startTime, endTime, status } = req.body;
  if (
    !doctorScheduleId ||
    !scheduleSlotId ||
    !startTime ||
    !endTime ||
    !status
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  try {
    // Step 1: Find the doctor schedule by its ID
    const doctorSchedule = await DoctorSchedule.findById(doctorScheduleId);
    if (!doctorSchedule) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Doctor schedule not found."));
    }
    // Step 2: Find the slot to update by its ID
    const slotIndex = doctorSchedule.scheduleSlots.findIndex(
      (slot) => slot._id.toString() === scheduleSlotId
    );
    if (slotIndex === -1) {
      return res.status(404).json(new ApiResponse(404, {}, "Slot not found."));
    }
    // Step 3: Convert new startTime and endTime (assumed to be in 24-hour "HH:mm" format) to minutes using your helper
    const newStart = convertToMinutes(startTime); // e.g., "14:00" -> 840
    const newEnd = convertToMinutes(endTime);
    if (newEnd <= newStart) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, "End time must be greater than start time.")
        );
    }
    // Inline helper to convert stored time (e.g., "10:30 AM") into minutes without extra packages
    const convertStoredTimeToMinutes = (timeStr) => {
      // timeStr is expected in the format "hh:mm A"
      const [timePart, modifier] = timeStr.split(" ");
      const [hourStr, minuteStr] = timePart.split(":");
      let hour = Number(hourStr);
      const minute = Number(minuteStr);
      if (modifier === "PM" && hour !== 12) {
        hour += 12;
      }
      if (modifier === "AM" && hour === 12) {
        hour = 0;
      }
      return hour * 60 + minute;
    };
    // Step 4: Check for overlapping slots excluding the slot being updated
    const isOverlapping = (newStart, newEnd, existingSlots) => {
      return existingSlots.some((existingSlot) => {
        // Exclude the slot being updated
        if (existingSlot._id.toString() === scheduleSlotId) return false;
        // Convert stored start and end times using our inline helper
        const existingStart = convertStoredTimeToMinutes(
          existingSlot.startTime
        );
        const existingEnd = convertStoredTimeToMinutes(existingSlot.endTime);
        // Check overlap using standard condition:
        return newStart < existingEnd && existingStart < newEnd;
      });
    };
    if (isOverlapping(newStart, newEnd, doctorSchedule.scheduleSlots)) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            {},
            "The new slot overlaps with an existing schedule."
          )
        );
    }
    // Step 5: Update the slot's startTime, endTime, and status
    const slotToUpdate = doctorSchedule.scheduleSlots[slotIndex];
    slotToUpdate.startTime = convertToTimeStr(newStart); // Converts minutes back to "hh:mm A" format
    slotToUpdate.endTime = convertToTimeStr(newEnd);
    slotToUpdate.status = status;
    // Step 6: Save the updated doctor schedule
    await doctorSchedule.save();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Slot updated successfully."));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update slot."));
  }
});

export const deleteSlot = asyncHandler(async (req, res) => {
  const { doctorScheduleId, scheduleSlotId } = req.params;
  if (!doctorScheduleId || !scheduleSlotId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Failed to delete slot."));
  }
  try {
    // Find the doctor schedule by its ID
    const doctorSchedule = await DoctorSchedule.findById(doctorScheduleId);
    if (!doctorSchedule) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Doctor schedule not found."));
    }
    // Locate the index of the slot to delete
    const slotIndex = doctorSchedule.scheduleSlots.findIndex(
      (slot) => slot._id.toString() === scheduleSlotId
    );
    if (slotIndex === -1) {
      return res.status(404).json(new ApiResponse(404, {}, "Slot not found."));
    }
    // Remove the slot from the array
    doctorSchedule.scheduleSlots.splice(slotIndex, 1);
    // Save the updated schedule
    await doctorSchedule.save();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Slot deleted successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete slot."));
  }
});
