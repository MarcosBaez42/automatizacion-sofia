import mongoose from 'mongoose';

const { Schema } = mongoose;

export const NOTIFICATION_RESULT_MESSAGE =
  'Reporte sin calificación confirmada; notificación enviada al instructor';

export const processingLogSchema = new Schema(
  {
    fiche: { type: Schema.Types.ObjectId, ref: 'Fiche', required: true },
    ficheNumber: { type: String, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor' },
    instructorName: String,
    instructorEmail: String,
    scheduleIds: [{ type: Schema.Types.ObjectId, ref: 'Schedules' }],
    scheduleCount: Number,
    graded: Boolean,
    gradeStatus: String,
    gradeDate: Date,
    qualifiable: Boolean,
    qualifiableDate: Date,
    reportFile: String,
    result: String,
    errorMessage: String,
    notificationSentAt: Date,
    processedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'dailyprocessinglogs'
  }
);

const DailyProcessingLog =
  mongoose.models.DailyProcessingLog ||
  mongoose.model('DailyProcessingLog', processingLogSchema);

export default DailyProcessingLog;