/**
 * @typedef {Object} Outcome
 * @property {string} outcomes - The outcomes of the competence.
 * @property {string} code - The code of the outcome.
 * @property {Schema.Types.ObjectId} competence - The competence that the outcome belongs to.
 * @property {number} status - The status of the outcome.
 * @property {Date} createdAt - The date when the outcome was created.
 * @property {Date} updatedAt - The date when the outcome was last updated.
 */
import { Schema, model } from "mongoose";

const OutcomesSquema = new Schema(
  {
    outcomes: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      default: "SIN CODIGO",
    },
    competence: {
      type: Schema.Types.ObjectId,
      ref: "Competence",
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

export default model("Outcomes", OutcomesSquema);
