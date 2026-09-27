import mongoose, { Schema, models, model } from "mongoose";

const DocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    fileName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "PUBLISHED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel =
  models.Document ||
  model("Document", DocumentSchema);

export default DocumentModel;