import { Router } from "express";
import {
  confirmStatus,
  createAppointment,
  deleteAppointment,
  editAppointment,
  getAppointments,
} from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getAppointments);
router.post("/create", createAppointment);
router.put("/edit/:id", verifyJWT, editAppointment);
router.put("/confirm-status/:id", verifyJWT, confirmStatus);
router.delete("/delete/:id", verifyJWT, deleteAppointment);

export default router;
