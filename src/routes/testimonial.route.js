import { Router } from "express";
import {
  getTestimonial,
  createTestimonial,
  editTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getTestimonial);
router.post("/create", verifyJWT, createTestimonial);
router.put("/edit/:id", verifyJWT, editTestimonial);
router.delete("/delete/:id", verifyJWT, deleteTestimonial);

export default router;
