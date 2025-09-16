/**
 * @typedef {Object} Environment
 * @property {string} name - The name of the environment.
 * @property {string} [description=""] - The description of the environment.
 * @property {Schema.Types.ObjectId} town - The ID of the town where the environment is located.
 * @property {number} [status=0] - The status of the environment.
 * @property {Date} createdAt - The date when the environment was created.
 * @property {Date} updatedAt - The date when the environment was last updated.
 */
import { Schema, model } from "mongoose";

const EnvironmentSquema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    town: {
      type: Schema.Types.ObjectId,
      ref: "Town",
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Environment", EnvironmentSquema);
