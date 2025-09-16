/**
 * @typedef {Object} Schedule
 * @property {string} _id - The unique ID of the schedule.
 * @property {string} fiche - The ID of the fiche associated with the schedule.
 * @property {string} program - The ID of the program associated with the schedule.
 * @property {string} competence - The ID of the competence associated with the schedule.
 * @property {string} outcome - The ID of the outcome associated with the schedule.
 * @property {string} instructor - The ID of the instructor associated with the schedule.
 * @property {string} supporttext - The support text for the schedule.
 * @property {string} observation - The observation for the schedule.
 * @property {string} environment - The ID of the environment associated with the schedule.
 * @property {Array} days - The days of the week for the schedule.
 * @property {Date} fstart - The start date of the schedule.
 * @property {Date} fend - The end date of the schedule.
 * @property {string} tstart - The start time of the schedule.
 * @property {string} tend - The end time of the schedule.
 * @property {Array} events - The events associated with the schedule.
 * @property {number} status - The status of the schedule.
 * @property {number} hourswork - The number of hours worked for the schedule.
 * @property {Date} createdAt - The date the schedule was created.
 * @property {Date} updatedAt - The date the schedule was last updated.
 */
import { Schema, model } from "mongoose";

const SchedulesSquema = new Schema(
  {
    fiche: {
      type: Schema.Types.ObjectId,
      ref: "Fiche",
      required: true,
    },
    program: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    competence: {
      //competencia
      type: Schema.Types.ObjectId,
      ref: "Competence",
      required: true,
    },
    outcome: {
      //resultados
      type: Schema.Types.ObjectId,
      ref: "Outcomes",
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    supporttext: {
      type: String,
      default: "",
    },
    observation: {
      type: String,
      default: "",
    },
    environment: {
      type: Schema.Types.ObjectId,
      ref: "Environment",
      required: true,
    },
    days: {
      // [0,1,2,3,4,5,6] || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
      type: Array,
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
    // ----- for shif -----
    tstart: {
      type: String,
      required: true,
    },
    tend: {
      type: String,
      required: true,
    },
    // ----- for shif -----
    events: {
      type: [Date],
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    hourswork: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Schedules", SchedulesSquema);
