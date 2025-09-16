import { Schema, model } from "mongoose";

const NewsSquema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      required: true,
    },
    acta: {
      type: String,
      default: "",
    },
    tpnew: {
      type: String,
      required: true,
    },
    typetransfer: {
      type: String,
      default: "",
    },
    subtype:{
      type:String,
      default:"",
    },
    workingday: {
      type: String,
      default: "",
    },
    center: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
    },
    fend: {
      type: Date,
      default: "",
    },
    tpdocument: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    cause: {
      type: String,
      default: "",
    },

    datesofia: {
      type: Date,
      default: Date.now,
    },
    fiche: {
      type: Schema.Types.ObjectId,
      ref: "Fiche",
      required: true,
    },
    coordination: {
      type: Schema.Types.ObjectId,
      ref: "Coordination",
      required: true,
    },
    answers: {
      type: Array,
      default: [],
    },

    processed: {
      type: Boolean,
      default: false,
    },
    dateprocessed: {
      type: Date,
      default: "",
      required: false,
    },
    statusstudent: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "REGISTRADA",
    },
    img: {
      type: Object,
      default: {},
    },
    status: {
      type: Number,
      default: 0,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor"
    },
  },
  {
    timestamps: true,
  }
);

export default model("New", NewsSquema);
