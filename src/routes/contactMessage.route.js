import { Router } from "express";
import {
  changeReadStatus,
  createContactMessage,
  deleteContactMessage,
  getContactMessage,
} from "../controllers/contactMessage.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getContactMessage);
router.post("/create", createContactMessage);
router.delete("/delete/:id", verifyJWT, deleteContactMessage);
router.put("/change-read-status/:id", verifyJWT, changeReadStatus);

export default router;
