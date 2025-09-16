import { Schema, model } from "mongoose";

const ImprovementSquema = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      required: true,
    },
    tpnew: {
      type: String,
      default: "PLAN DE MEJORAMIENTO",
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
      default: "",
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
    fend: {
      type: Date,
      default: Date.now,
    },
    activity: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "REGISTRADO",
    },
    type: {//académico o disciplinario
      type: String,
      default: "ACADEMICO",
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
    },
  },
  {
    timestamps: true,
  }
);



export default model("Improvement", ImprovementSquema);
