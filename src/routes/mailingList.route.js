import { Router } from "express";
import {
  createMailingListEntry,
  deleteMailingListEntry,
  getMailingList,
} from "../controllers/mailingList.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getMailingList);
router.post("/create", createMailingListEntry);
router.delete("/delete/:id", verifyJWT, deleteMailingListEntry);

export default router;
