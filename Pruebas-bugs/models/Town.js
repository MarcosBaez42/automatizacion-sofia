/**
 * @typedef {Object} Town
 * @property {string} name - The name of the town.
 * @property {string} departament - The department where the town is located.
 * @property {number} status - The status of the town.
 * @property {Date} createdAt - The date when the town was created.
 * @property {Date} updatedAt - The date when the town was last updated.
 */
import { Schema, model } from "mongoose";

const TownsSquema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    departament: {
      type: String,
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

export default model("Town", TownsSquema);
