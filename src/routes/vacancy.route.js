import { Router } from "express";
import {
  getVacancy,
  createVacancy,
  editVacancy,
  deleteVacancy,
  getCurrentOpening,
} from "../controllers/vacancy.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/current-opening", getCurrentOpening);
router.get("/", getVacancy);
router.post("/create", verifyJWT, createVacancy);
router.put("/edit/:id", verifyJWT, editVacancy);
router.delete("/delete/:id", verifyJWT, deleteVacancy);

export default router;
