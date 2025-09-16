/**
 * Competence schema
 * @typedef {Object} Competence
 * @property {string} name - The name of the competence
 * @property {string} number - The number of the competence
 * @property {Schema.Types.ObjectId} program - The program that the competence belongs to
 * @property {number} status - The status of the competence
 * @property {Date} createdAt - The date when the competence was created
 * @property {Date} updatedAt - The date when the competence was last updated
 */
import { Schema, model } from "mongoose";

const CompetenceSquema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    program: {
      type: Schema.Types.ObjectId,
      ref: "Program",
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

export default model("Competence", CompetenceSquema);
