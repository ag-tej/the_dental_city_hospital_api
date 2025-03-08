import { Router } from "express";
import {
  getAllBlogsWithoutContent,
  getAllBlogs,
  getSingleBlog,
  createBlog,
  editBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/no-content", getAllBlogsWithoutContent);
router.get("/", getAllBlogs);
router.get("/:id", getSingleBlog);
router.post("/create", verifyJWT, upload.single("image"), createBlog);
router.put("/edit/:id", verifyJWT, upload.single("image"), editBlog);
router.delete("/delete/:id", verifyJWT, deleteBlog);

export default router;
