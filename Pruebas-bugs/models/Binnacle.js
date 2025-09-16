/**
 * @typedef {Object} Binnacle
 * @property {string} user - The user who performed the action (optional)
 * @property {string} email - The email of the user who performed the action (optional)
 * @property {string} action - The action that was performed (required)
 * @property {string} information - Additional information about the action (required)
 * @property {Date} createdAt - The date and time the document was created
 * @property {Date} updatedAt - The date and time the document was last updated
 */
import { Schema, model } from "mongoose";

const BinnacleSquema = new Schema(
  {
    user: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      default: "NO SE REGISTRO UNA ACCION",
      required: true,
    },
    information: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Binnacle", BinnacleSquema);
