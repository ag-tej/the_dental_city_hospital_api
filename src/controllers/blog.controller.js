import { Blog } from "../models/blog.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFiles, deleteFiles } from "../utils/cloudinary.js";

export const getAllBlogsWithoutContent = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find().select("-content");
    if (!blogs) {
      return res.status(404).json(new ApiResponse(404, {}, "No blogs found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, blogs, "Blogs fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch blogs."));
  }
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find();
    if (!blogs) {
      return res.status(404).json(new ApiResponse(404, {}, "No blogs found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, blogs, "Blogs fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch blogs."));
  }
});

export const getSingleBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { view_count: 1 } },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json(new ApiResponse(404, {}, "Blog not found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch blog."));
  }
});

export const createBlog = asyncHandler(async (req, res) => {
  const { title, author, content } = req.body;
  if (!title || !author || !content || !req.file) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  const { successfulUploads, failedUploads } = await uploadFiles([req.file]);
  if (failedUploads.length > 0 || successfulUploads.length === 0) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Image upload failed."));
  }
  const cover_image = successfulUploads[0];
  try {
    const blogData = new Blog({
      title,
      cover_image,
      author,
      content,
    });
    const blog = await Blog.create(blogData);
    if (!blog) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to create blog."));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Blog created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to create blog."));
  }
});

export const editBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json(new ApiResponse(404, {}, "Blog not found."));
  }
  const { title, author, content } = req.body;
  if (!title || !author || !content) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Title, author and content are required.")
      );
  }
  let cover_image = blog.cover_image;
  if (req.file) {
    const publicId = blog.cover_image.split("/").pop().split(".")[0];
    await deleteFiles([publicId]);
    const { successfulUploads, failedUploads } = await uploadFiles([req.file]);
    if (failedUploads.length > 0 || successfulUploads.length === 0) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Image upload failed."));
    }
    cover_image = successfulUploads[0];
  }
  const updates = { title, cover_image, author, content };
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedBlog) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to update blog."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, updatedBlog, "Blog updated successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update blog."));
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json(new ApiResponse(404, {}, "Blog not found."));
  }
  const publicId = blog.cover_image.split("/").pop().split(".")[0];
  await deleteFiles([publicId]);
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to delete blog."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, deletedBlog, "Blog deleted successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete blog."));
  }
});
