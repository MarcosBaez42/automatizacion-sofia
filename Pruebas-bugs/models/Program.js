/**
 * @typedef {Object} Program
 * @property {string} code - The code of the program.
 * @property {string} name - The name of the program.
 * @property {string} version - The version of the program.
 * @property {number} status - The status of the program.
 * @property {Date} createdAt - The date when the program was created.
 * @property {Date} updatedAt - The date when the program was last updated.
 */
import { Schema, model } from "mongoose";

const ProgramSquema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    version: {
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

export default model("Program", ProgramSquema);
