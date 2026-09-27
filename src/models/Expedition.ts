import mongoose, {
  Schema,
  models,
  model,
} from "mongoose";

const ExpeditionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    region: {
      type: String,
      required: true,
      default: "ANTARCTICA",
    },

    status: {
      type: String,
      enum: [
        "PLANNED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PLANNED",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    location: {
      type: String,
      default: "",
    },

    vessel: {
      type: String,
      default: "",
    },

    lead: {
      type: String,
      default: "",
    },

    organization: {
      type: String,
      default: "",
    },

    researchFocus: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    coverImageUrl: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const ExpeditionModel =
  models.Expedition ||
  model(
    "Expedition",
    ExpeditionSchema,
  );

export default ExpeditionModel;