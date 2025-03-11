import { ContactMessage } from "../models/contactMessage.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getContactMessage = asyncHandler(async (req, res) => {
  try {
    const contactMessages = await ContactMessage.find();
    if (!contactMessages) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No contact messages found."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contactMessages,
          "Contact messages fetched successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch contact messages."));
  }
});

export const createContactMessage = asyncHandler(async (req, res) => {
  const { fullname, phone, email, message } = req.body;
  if (!fullname || !phone || !email || !message) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "All fields are required to send a message.")
      );
  }
  try {
    const contactMessageData = new ContactMessage({
      fullname,
      phone,
      email,
      message,
    });
    const contactMessage = await ContactMessage.create(contactMessageData);
    if (!contactMessage) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to submit contact message."));
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, {}, "Contact message submitted successfully.")
      );
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            {},
            "This contact message has already been submitted."
          )
        );
    }
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to submit contact message."));
  }
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contactMessage = await ContactMessage.findById(id);
  if (!contactMessage) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Contact message not found."));
  }
  try {
    const deletedContactMessage = await ContactMessage.findByIdAndDelete(id);
    if (!deletedContactMessage) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to delete contact message."));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedContactMessage,
          "Contact message deleted successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to delete contact message."));
  }
});

export const changeReadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const contactMessage = await ContactMessage.findById(id);
    if (!contactMessage) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Contact message not found."));
    }
    // Toggle the read status (if it's true, set to false; if false, set to true)
    contactMessage.read_status = !contactMessage.read_status;
    await contactMessage.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contactMessage,
          `Read status updated to ${
            contactMessage.read_status ? "read" : "unread"
          } successfully.`
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update read status."));
  }
});
