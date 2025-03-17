import { Router } from "express";
import {
  createDoctorSchedule,
  deleteSlot,
  editSlot,
  getAvailableSlots,
  getDoctorSchedule,
} from "../controllers/doctorSchedule.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/available-slots", getAvailableSlots);
router.get("/:id", verifyJWT, getDoctorSchedule);
router.post("/create", verifyJWT, createDoctorSchedule);
router.put("/edit-slot/:doctorScheduleId/:scheduleSlotId", verifyJWT, editSlot);
router.delete(
  "/delete-slot/:doctorScheduleId/:scheduleSlotId",
  verifyJWT,
  deleteSlot
);

export default router;
