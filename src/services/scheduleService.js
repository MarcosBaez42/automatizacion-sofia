import Schedule from '../models/Schedule.js';
import Fiche from '../models/Fiche.js';
import Instructor from '../models/Instructor.js';

const PROCESS_NAME = 'processSchedules';

export function buildPendingSchedulesPipeline(limitDate) {
  return [
    {
      $match: {
        $and: [
          { fend: { $lt: limitDate } },
          {
            $or: [
              { calificado: { $exists: false } },
              { calificado: false },
              { calificado: null }
            ]
          },
          {
            $or: [
              { calificable: { $exists: false } },
              { calificable: true },
              { calificable: null },
              { calificable: { $nin: [true, false] } }
            ]
          }
        ]
      }
    },
    {
      $group: {
        _id: '$fiche',
        scheduleIds: { $addToSet: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: Fiche.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'fiche'
      }
    },
    { $unwind: '$fiche' },
    {
      $lookup: {
        from: Instructor.collection.name,
        localField: 'fiche.owner',
        foreignField: '_id',
        as: 'instructor'
      }
    },
    {
      $unwind: {
        path: '$instructor',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        ficheId: '$_id',
        scheduleIds: 1,
        scheduleCount: '$count',
        ficheNumber: '$fiche.number',
        instructorId: '$instructor._id',
        instructorName: '$instructor.name',
        instructorEmail: '$instructor.email',
        instructorEmailPersonal: '$instructor.emailpersonal'
      }
    }
  ];
}

export function getPendingScheduleGroups(limitDate) {
  const pipeline = buildPendingSchedulesPipeline(limitDate);
  return Schedule.aggregate(pipeline);
}

export function updateSchedulesAsGraded(scheduleIds, { gradeDate, gradeStatus }) {
  const effectiveGradeDate = gradeDate || new Date();
  return Schedule.updateMany(
    { _id: { $in: scheduleIds } },
    {
      $set: {
        calificado: true,
        calificable: true,
        fechaCalificacion: effectiveGradeDate,
        estadoCalificacion: gradeStatus,
        calificadoPorProceso: PROCESS_NAME
      },
      $unset: { fechaCalificable: '' }
    }
  );
}

export function updateSchedulesAsPending(
  scheduleIds,
  { gradeDate, gradeStatus },
  { qualifiableFuture }
) {
  return Schedule.updateMany(
    { _id: { $in: scheduleIds } },
    {
      $set: {
        calificado: false,
        calificable: !qualifiableFuture,
        fechaCalificacion: gradeDate || null,
        estadoCalificacion: gradeStatus,
        calificadoPorProceso: PROCESS_NAME
      },
      $unset: { fechaCalificable: '' }
    }
  );
}