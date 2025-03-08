import { Router } from "express";
import {
  changeReadStatus,
  createJobApplication,
  deleteJobApplication,
  getJobApplication,
} from "../controllers/jobApplication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", verifyJWT, getJobApplication);
router.post(
  "/create",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "other_document", maxCount: 1 },
  ]),
  createJobApplication
);
router.delete("/delete/:id", verifyJWT, deleteJobApplication);
router.put("/change-read-status/:id", verifyJWT, changeReadStatus);

export default router;
