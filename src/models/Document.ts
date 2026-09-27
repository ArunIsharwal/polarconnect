import mongoose, {
  Schema,
  models,
  model,
} from "mongoose";

const DocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    contentType: {
      type: String,
      default: "REPORT",
    },

    region: {
      type: String,
      default: "ANTARCTICA",
    },

    year: {
      type: Number,
    },

    description: {
      type: String,
      default: "",
    },

    // Manually entered tags.
    tags: {
      type: [String],
      default: [],
    },

    fileName: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "PENDING",
    },

    // -------------------------------
    // AI SUMMARY
    // -------------------------------

    aiSummary: {
      type: String,
      default: "",
    },

    aiStatus: {
      type: String,
      enum: [
        "NOT_STARTED",
        "PROCESSING",
        "COMPLETE",
        "FAILED",
      ],
      default: "NOT_STARTED",
    },

    aiProcessedAt: {
      type: Date,
      default: null,
    },

    // -------------------------------
    // AI SUGGESTED TAGS
    // -------------------------------

    aiSuggestedTags: {
      type: [String],
      default: [],
    },

    aiTagsStatus: {
      type: String,
      enum: [
        "NOT_STARTED",
        "PROCESSING",
        "COMPLETE",
        "FAILED",
      ],
      default: "NOT_STARTED",
    },

    aiTagsProcessedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DocumentModel =
  models.Document ||
  model("Document", DocumentSchema);

export default DocumentModel;