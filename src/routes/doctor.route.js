import { Router } from "express";
import {
  createDoctor,
  deleteDoctor,
  editDoctor,
  getDoctor,
} from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getDoctor);
router.post("/create", verifyJWT, upload.single("image"), createDoctor);
router.put("/edit/:id", verifyJWT, upload.single("image"), editDoctor);
router.delete("/delete/:id", verifyJWT, deleteDoctor);

export default router;
