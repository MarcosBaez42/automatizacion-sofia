import mongoose from 'mongoose';

const { Schema } = mongoose;

const scheduleSchema = new Schema(
  {
    fiche: { type: Schema.Types.ObjectId, ref: 'Fiche', required: true },
    fend: { type: Date },
    calificado: { type: Boolean, default: false },
    calificable: { type: Boolean, default: true },
    fechaCalificable: { type: Date },
    fechaCalificacion: { type: Date },
    estadoCalificacion: { type: String },
    calificadoPorProceso: { type: String }
  },
  {
    collection: 'schedules',
    timestamps: true,
    strict: false
  }
);

const Schedule = mongoose.models.Schedules ||
  mongoose.model('Schedules', scheduleSchema);

export default Schedule;