import { MailingList } from "../models/mailingList.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMailingList = asyncHandler(async (req, res) => {
  try {
    const mailingList = await MailingList.find().sort({ createdAt: -1 });
    if (!mailingList) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            {},
            "No email addresses found in the mailing list."
          )
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, mailingList, "Mailing list fetched successfully.")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to fetch mailing list."));
  }
});

export const createMailingListEntry = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Email is required to join the mailing list.")
      );
  }
  try {
    const existingEmail = await MailingList.findOne({ email });
    if (existingEmail) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, {}, "This email is already in the mailing list.")
        );
    }
    const newMailingListEntry = new MailingList({ email });
    const savedEmail = await newMailingListEntry.save();
    if (!savedEmail) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Failed to add email to the mailing list.")
        );
    }
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          {},
          "Email added to the mailing list successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Failed to add email to the mailing list.")
      );
  }
});

export const deleteMailingListEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mailingListEntry = await MailingList.findById(id);
  if (!mailingListEntry) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, {}, "Email address not found in the mailing list.")
      );
  }
  try {
    const deletedMailingListEntry = await MailingList.findByIdAndDelete(id);
    if (!deletedMailingListEntry) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, {}, "Failed to delete email from mailing list.")
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Email removed from the mailing list successfully."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Failed to delete email from mailing list.")
      );
  }
});
