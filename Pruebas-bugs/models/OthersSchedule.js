/**
 * @typedef {Object} OtherSchedule
 * @property {Schema.Types.ObjectId} instructor - The ID of the instructor associated with the schedule
 * @property {string} typeactivity - The type of activity for the schedule
 * @property {string} additionalactivity - Additional information about the activity
 * @property {number} hourswork - The number of hours worked for the schedule
 * @property {Date} fstart - The start date for the schedule
 * @property {Date} fend - The end date for the schedule
 * @property {string} tstart - The start time for the schedule
 * @property {string} tend - The end time for the schedule
 * @property {Array<number|string>} days - An array of numbers or strings representing the days of the week for the schedule
 * @property {string} justification - The justification for the schedule
 * @property {Array<Date>} events - An array of dates for events associated with the schedule
 * @property {number} status - The status of the schedule
 * @property {Date} createdAt - The date the schedule was created
 * @property {Date} updatedAt - The date the schedule was last updated
 */
import { Schema, model } from "mongoose";

const OtherSchedulesSquema = new Schema(
  {
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    typeactivity: {
      type: String,
      default: "",
    },
    otheractivity: {
      type: String,
      default: "",
    },
    additionalactivity: {
      type: String,
      default: "",
    },
    hourswork: {
      type: Number,
      required: true,
    },
    fstart: {
      type: Date,
      required: true,
    },
    fend: {
      type: Date,
      required: true,
    },
    tstart: {
      type: String,
      required: true,
    },
    tend: {
      type: String,
      required: true,
    },
    days: {
      // [0,1,2,3,4,5,6] || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
      type: Array,
      required: true,
    },
    justification: {
      type: String,
      default: "",
    },
    events: {
      type: [Date],
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

export default model("OtherSchedules", OtherSchedulesSquema);
