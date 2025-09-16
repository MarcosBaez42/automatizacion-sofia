/**
 * this module exports an object containing validation functions for other schedule.
 * @module validations/otherschedule.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/otherschedule.helper
 * @requires helpers/program.helper
 * @requires helpers/instructor.helper
 * @exports otherScheduleVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { otherScheduleHelper } from "../helpers/otherschedule.helper.js";
import { instrHelper } from "../helpers/instructor.helper.js";
import { dateFormater } from "../utils/functions/dates.js";

const {
  validateExistScheduleById,
  validateSaveOtherSchedule,
  validateOtherSchedule,
  validateActiveSchedule
 } =
  otherScheduleHelper;

const { validateExistInstrById } = instrHelper;

const { validateToken } = webToken;
/**
 * Object containing validation functions for other schedule registration, existence, update, and headers.
 */

const otherScheduleVali = {};
const daysValid = [0, 1, 2, 3, 4, 5, 6];

/**
 * Validation if exist instructor.
 * @memberof otherScheduleVali
 * @function
 * @name validateInstructor
 * @param {Array} Array of validation checks.
 * @description This function validates the id of the instructor and the token when getting the other schedules of an instructor.
 */
otherScheduleVali.validateInstructor = [
  check("id", "El instructor es obligatorio").notEmpty(),
  check("id", "El instructor no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistInstrById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for other schedule before registration.
 * @memberof otherScheduleVali
 * @function
 * @name validateOtherSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the instructor, the program, the additional activity, the start time, the end time, the start date, the end date, the days, and the justification when before register an other schedule.
 */
otherScheduleVali.validateOtherSchedule = [
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("typeactivity", "El programa es obligatorio").notEmpty(),
  check("additionalactivity","La actividad adicional es obligatoria").notEmpty(),
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date().toISOString().split("T")[0];
      const tStartToDate = new Date(`${currentDate}T${tstart}:00.000Z`);
      const tEndToDate = new Date(`${currentDate}T${req.body.tend}:00.000Z`);

      try {
        if (
          tStartToDate > tEndToDate ||
          tStartToDate == "Invalid Date" ||
          tEndToDate == "Invalid Date"
        ) {
          throw new Error(
            "La hora de inicio no puede ser mayor a la hora de fin"
          );
        }
      } catch (error) {
        console.log(error);
        throw new Error("Horas no validas");
      }
    }
  }),

  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("days", "Los dias son obligatorios").notEmpty(),
  check("days", "Los dias no son validos").isArray(),
  check("days").custom(async (days) => {
    days.forEach((day) => {
      if (!daysValid.includes(day)) {
        throw new Error("Los dias no son validos");
      }
    });
  }),
  check("justification", "La justificacion es obligatoria").notEmpty(),
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      instructor != null &&
      req.body.days != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
      await validateOtherSchedule(
        null,
        instructor,
        req.body.days,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req
      );
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for other schedule before update.
 * @memberof otherScheduleVali
 * @function
 * @name validateOtherScheduleEdit
 * @param {Array} Array of validation checks.
 * @description This function validates the id of the other schedule, the instructor, the program, the additional activity, the start time, the end time, the start date, the end date, the days, and the justification when before update an other schedule.
 */

otherScheduleVali.validateOtherScheduleEdit = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistScheduleById(id);
  }),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("typeactivity", "El programa es obligatorio").notEmpty(),
  check(
    "additionalactivity",
    "La actividad adicional es obligatoria"
  ).notEmpty(),
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date().toISOString().split("T")[0];
      const tStartToDate = new Date(`${currentDate}T${tstart}:00.000Z`);
      const tEndToDate = new Date(`${currentDate}T${req.body.tend}:00.000Z`);

      console.log(tStartToDate);
      console.log(tEndToDate);
      try {
        if (
          tStartToDate > tEndToDate ||
          tStartToDate == "Invalid Date" ||
          tEndToDate == "Invalid Date"
        ) {
          throw new Error(
            "La hora de inicio no puede ser mayor a la hora de fin"
          );
        }
      } catch (error) {
        console.log(error);
        throw new Error("Horas no validas");
      }
    }
  }),

  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("days", "Los dias son obligatorios").notEmpty(),
  check("days", "Los dias no son validos").isArray(),
  check("days").custom(async (days) => {
    days.forEach((day) => {
      if (!daysValid.includes(day)) {
        throw new Error("Los dias no son validos");
      }
    });
  }),
  check("justification", "La justificacion es obligatoria").notEmpty(),
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      instructor != null &&
      req.body.days != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
      await validateOtherSchedule(
        req.params.id,
        instructor,
        req.body.days,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req
      );
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for other schedule registration.
 * @memberof otherScheduleVali
 * @function
 * @name validateRegisterOtherSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the instructor, the program, the additional activity, the start time, the end time, the start date, the end date, the days, and the justification when registering an other schedule.
 */

otherScheduleVali.validateRegisterOtherSchedule = [
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("typeactivity", "El tipo de actividad es obligatorio").notEmpty(),
  check(
    "additionalactivity",
    "La actividad adicional es obligatoria"
  ).notEmpty(),
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date().toISOString().split("T")[0];
      const tStartToDate = new Date(`${currentDate}T${tstart}:00.000Z`);
      const tEndToDate = new Date(`${currentDate}T${req.body.tend}:00.000Z`);

      try {
        if (
          tStartToDate > tEndToDate ||
          tStartToDate == "Invalid Date" ||
          tEndToDate == "Invalid Date"
        ) {
          throw new Error(
            "La hora de inicio no puede ser mayor a la hora de fin"
          );
        }
      } catch (error) {
        console.log(error);
        throw new Error("Horas no validas");
      }
    }
  }),

  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("events", "Los eventos son obligatorios").notEmpty(),
  check("events", "Los eventos no son validos").isArray(),
  //validate that the events are dates
  check("events").custom(async (events) => {
    //validar que los events sea un array
    if (Array.isArray(events)) {
      //['2021-01-01','2021-01-02']
      events.forEach((event) => {
        const date = new Date(event.start);
        if (date == "Invalid Date") {
          throw new Error("Los eventos no son validos");
        }
      });
    }
  }),
  check("days", "Los dias son obligatorios").notEmpty(),
  check("days", "Los dias no son validos").isArray(),
  check("days").custom(async (days) => {
    console.log(days);
    days.forEach((day) => {
      if (!daysValid.includes(day)) {
        throw new Error("Los dias no son validos");
      }
    });
  }),
  check("justification", "La justificacion es obligatoria").notEmpty(),
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      instructor != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
      await validateSaveOtherSchedule(
        null,
        instructor,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req.body.events
      );
    }
  }),
  check("otheractivity").custom(async (otheractivity, { req }) => {
    if(req.body.additionalactivity.toString().toUpperCase() == "OTRO"){
      if(otheractivity == null || otheractivity == ""){
        throw new Error("La informacion adicional es obligatoria");
      }
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for other schedule update.
 * @memberof otherScheduleVali
 * @function
 * @name validateUpdateOtherSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the id of the other schedule, the instructor, the program, the additional activity, the start time, the end time, the start date, the end date, the days, and the justification when updating an other schedule.
 */

otherScheduleVali.validateUpdateOtherSchedule = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistScheduleById(id);
  }),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("typeactivity", "El tipo de actividad es obligatorio").notEmpty(),
  check(
    "additionalactivity",
    "La actividad adicional es obligatoria"
  ).notEmpty(),
  check("otheractivity").custom(async (otheractivity, { req }) => {
    if(req.body.additionalactivity.toString().toUpperCase() == "OTRO"){
      if(otheractivity == null || otheractivity == ""){
        throw new Error("La informacion adicional es obligatoria");
      }
    }
  }),
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date().toISOString().split("T")[0];
      const tStartToDate = new Date(`${currentDate}T${tstart}:00.000Z`);
      const tEndToDate = new Date(`${currentDate}T${req.body.tend}:00.000Z`);

      try {
        if (
          tStartToDate > tEndToDate ||
          tStartToDate == "Invalid Date" ||
          tEndToDate == "Invalid Date"
        ) {
          throw new Error(
            "La hora de inicio no puede ser mayor a la hora de fin"
          );
        }
      } catch (error) {
        console.log(error);
        throw new Error("Horas no validas");
      }
    }
  }),

  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),

  check("days", "Los dias son obligatorios").notEmpty(),
  check("days", "Los dias no son validos").isArray(),
  check("days").custom(async (days) => {
    days.forEach((day) => {
      if (!daysValid.includes(day)) {
        throw new Error("Los dias no son validos");
      }
    });
  }),

  check("events", "Los eventos son obligatorios").notEmpty(),
  check("events", "Los eventos no son validos").isArray(),
  //validate that the events are dates
  check("events").custom(async (events) => {
    //validar que los events sea un array
    if (Array.isArray(events)) {
      events.forEach((event) => {
        const date = new Date(event.start);
        if (date == "Invalid Date") {
          throw new Error("Los eventos no son validos");
        }
      });
    }
  }),
  check("justification", "La justificacion es obligatoria").notEmpty(),
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      instructor != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
      await validateSaveOtherSchedule(
        req.params.id,
        instructor,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req.body.events
      );
    }
  }),
  check("otheractivity").custom(async (otheractivity, { req }) => {
    if(req.body.additionalactivity.toString().toUpperCase() == "OTRO"){
      if(otheractivity == null || otheractivity == ""){
        throw new Error("La informacion adicional es obligatoria");
      }
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

otherScheduleVali.validateActiveOtherSchedule = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveSchedule(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

//validate if exist schedule
otherScheduleVali.validateExistOtherSchedule = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistScheduleById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for headers.
 * @memberof otherScheduleVali
 * @function
 * @name validateHeaders
 * @param {Array} Array of validation checks.
 * @description This function validates the token in the headers.
 */
otherScheduleVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { otherScheduleVali };
