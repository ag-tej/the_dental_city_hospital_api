import { Vacancy } from "../models/vacancy.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCurrentOpening = asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();
    const vacancies = await Vacancy.find({
      last_date: { $gte: currentDate },
    });
    if (!vacancies) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            {},
            "No vacancies found with the past application deadline."
          )
        );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, vacancies, "Vacancies fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch vacancies."));
  }
});

export const getVacancy = asyncHandler(async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdAt: -1 });
    if (!vacancies) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No vacancies found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, vacancies, "Vacancies fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch vacancies."));
  }
});

export const createVacancy = asyncHandler(async (req, res) => {
  const { job_title, description, last_date } = req.body;
  if (!job_title || !description || !last_date) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  try {
    const vacancyData = new Vacancy({
      job_title,
      description,
      last_date,
    });
    const vacancy = await Vacancy.create(vacancyData);
    if (!vacancy) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to create vacancy."));
    }
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Vacancy created successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to create vacancy."));
  }
});

export const editVacancy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vacancy = await Vacancy.findById(id);
  if (!vacancy) {
    return res.status(404).json(new ApiResponse(404, {}, "Vacancy not found."));
  }
  const { job_title, description, last_date } = req.body;
  if (!job_title || !description || !last_date) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }
  const updates = { job_title, description, last_date };
  try {
    const updatedVacancy = await Vacancy.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedVacancy) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to update vacancy."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Vacancy updated successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update vacancy."));
  }
});

export const deleteVacancy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vacancy = await Vacancy.findById(id);
  if (!vacancy) {
    return res.status(404).json(new ApiResponse(404, {}, "Vacancy not found."));
  }
  try {
    const deletedVacancy = await Vacancy.findByIdAndDelete(id);
    if (!deletedVacancy) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to delete vacancy."));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Vacancy deleted successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete vacancy."));
  }
});
