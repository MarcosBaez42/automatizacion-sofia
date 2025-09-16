/**
 * @typedef {Object} Coordination
 * @property {string} name - The name of the coordination.
 * @property {Schema.Types.ObjectId} coordinator - The ID of the user who coordinates the coordination.
 * @property {string} modality - The modality of the coordination.
 * @property {string} email - The email of the coordination.
 * @property {string} passapp - The password of the coordination.
 * @property {number} status - The status of the coordination.
 * @property {Date} createdAt - The date when the coordination was created.
 * @property {Date} updatedAt - The date when the coordination was last updated.
 */
import { Schema, model } from "mongoose";

const CoordinationSquema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    coordinator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programmers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    modality: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    namefoldernew: {
      type: String,
      required: true,
    },
    passapp: {
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

export default model("Coordination", CoordinationSquema);
