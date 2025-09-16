import { Schema, model } from "mongoose";

const HistoryScheduleSquema = new Schema(
  {
    fiche: {
      type: Schema.Types.ObjectId,
      ref: "Fiche",
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    shedule: {
      type: Schema.Types.ObjectId,
      ref: "Schedules",
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

export default model("HistorySchedule", HistoryScheduleSquema);
