/**
 * This file contains validation functions for the schedule model.
 * @file This file defines the schedule validation functions.
 * @summary Validation functions for the schedule model.
 * @description This file contains validation functions for the schedule model, including validation for the existence of related entities, date and time validation, and token validation.
 * @requires express-validator
 * @requires ../middlewares/webToken.js
 * @requires ../middlewares/validateFields.js
 * @requires ../helpers/schedule.helper.js
 * @requires ../helpers/fiche.helper.js
 * @requires ../helpers/program.helper.js
 * @requires ../helpers/competence.helper.js
 * @requires ../helpers/environment.helper.js
 * @requires ../helpers/outcome.helper.js
 * @requires ../helpers/instructor.helper.js
 * @exports scheduleVali
 */


import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { scheduleHelper } from "../helpers/schedule.helper.js";
import { ficheHelper } from "../helpers/fiche.helper.js";
import { programHelper } from "../helpers/program.helper.js";
import { competenceHelper } from "../helpers/competence.helper.js";
import { environmentHelper } from "../helpers/environment.helper.js";
import { outcomeHelper } from "../helpers/outcome.helper.js";
import { instrHelper } from "../helpers/instructor.helper.js";
import { dateFormater } from "../utils/functions/dates.js";

const {
  validateExistScheduleById,
  validateScheduleInstructor,
  validateSaveSchedule,
  validateActiveSchedule,
} = scheduleHelper;

const { validateExistFicheById } = ficheHelper;
const { validateExistProgramById } = programHelper;
const { validateExistCompetenceById } = competenceHelper;
const { validateExistEnvironmentById } = environmentHelper;
const { validateExistOutcomeById } = outcomeHelper;
const { validateExistInstrById } = instrHelper;

const { validateToken } = webToken;

/**
 * Object containing validation functions for schedule.
 * @namespace scheduleVali
 */
const scheduleVali = {};
const daysValid = [0, 1, 2, 3, 4, 5, 6];

/**
 * Validation function for ficha.
 * @memberof scheduleVali
 * @function
 * @name validateFiche
 * @param {Array} Array of validation checks.
 * @description This function validates the id and token when searching for a schedule by ficha.
 */
scheduleVali.validateFiche = [
  check("id", "La ficha es obligatoria").notEmpty(),
  check("id", "La ficha no es valida").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistFicheById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for schedule.
 * @memberof scheduleVali
 * @function
 * @name validateSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the fields of the schedule model before register it.
 */
scheduleVali.validateSchedule = [
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (competence) => {
    await validateExistCompetenceById(competence);
  }),
  check("outcome", "El resultado de aprendizaje es obligatorio").notEmpty(),
  check("outcome", "El resultado de aprendizaje no es valido").isMongoId(),
  check("outcome").custom(async (outcome) => {
    await validateExistOutcomeById(outcome);
  }),
  check("environment", "El ambiente es obligatorio").notEmpty(),
  check("environment", "El ambiente no es valido").isMongoId(),
  check("environment").custom(async (environment) => {
    await validateExistEnvironmentById(environment);
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
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      req.body.fiche != null &&
      instructor != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
      await validateScheduleInstructor(
        null,
        req.body.fiche,
        instructor,
        req.body.environment,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req.body.days,
        req
      );
    }
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
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date()
      const tStartToDate = dateFormater(currentDate, tstart);
      const tEndToDate = dateFormater(currentDate, req.body.tend);

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

  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for edit schedule.
 * @memberof scheduleVali
 * @function
 * @name validateScheduleEdit
 * @param {Array} Array of validation checks.
 * @description This function validates the fields of the schedule model when editing.
 */

scheduleVali.validateScheduleEdit = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistScheduleById(id);
  }),
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (competence) => {
    await validateExistCompetenceById(competence);
  }),
  check("outcome", "El resultado de aprendizaje es obligatorio").notEmpty(),
  check("outcome", "El resultado de aprendizaje no es valido").isMongoId(),
  check("outcome").custom(async (outcome) => {
    await validateExistOutcomeById(outcome);
  }),
  check("environment", "El ambiente es obligatorio").notEmpty(),
  check("environment", "El ambiente no es valido").isMongoId(),
  check("environment").custom(async (environment) => {
    await validateExistEnvironmentById(environment);
  }),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
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
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      req.body.fiche != null &&
      instructor != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
      await validateScheduleInstructor(
        req.params.id,
        req.body.fiche,
        instructor,
        req.body.environment,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req.body.days,
        req
      );
    }
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
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date()
      const tStartToDate = dateFormater(currentDate, tstart);
      const tEndToDate = dateFormater(currentDate, req.body.tend);

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

  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for register schedule.
 * @memberof scheduleVali
 * @function
 * @name validateRegisterSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the fields of the schedule for register it.
 */

scheduleVali.validateRegisterSchedule = [
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (competence) => {
    await validateExistCompetenceById(competence);
  }),
  check("outcome", "El resultado de aprendizaje es obligatorio").notEmpty(),
  check("outcome", "El resultado de aprendizaje no es valido").isMongoId(),
  check("outcome").custom(async (outcome) => {
    await validateExistOutcomeById(outcome);
  }),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("environment", "El ambiente es obligatorio").notEmpty(),
  check("environment", "El ambiente no es valido").isMongoId(),
  check("environment").custom(async (environment) => {
    await validateExistEnvironmentById(environment);
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
  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      req.body.fiche != null &&
      instructor != null &&
      req.body.tstart != null &&
      req.body.tend != null 
    ) {
      await validateSaveSchedule(
        null,
        req.body.fiche,
        instructor,
        req.body.environment,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend, 
        req.body.events
      );
    }
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
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date()
      const tStartToDate = dateFormater(currentDate, tstart);
      const tEndToDate = dateFormater(currentDate, req.body.tend);

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
        throw new Error("Horas no validas");
      }
    }
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
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for update schedule.
 * @memberof scheduleVali
 * @function
 * @name validateUpdateSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the fields of the schedule model when updating.
 */
scheduleVali.validateUpdateSchedule = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistScheduleById(id);
  }),
  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (competence) => {
    await validateExistCompetenceById(competence);
  }),
  check("outcome", "El resultado de aprendizaje es obligatorio").notEmpty(),
  check("outcome", "El resultado de aprendizaje no es valido").isMongoId(),
  check("outcome").custom(async (outcome) => {
    await validateExistOutcomeById(outcome);
  }),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("environment", "El ambiente es obligatorio").notEmpty(),
  check("environment", "El ambiente no es valido").isMongoId(),
  check("environment").custom(async (environment) => {
    await validateExistEnvironmentById(environment);
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

  check("instructor").custom(async (instructor, { req }) => {
    if (
      req.body.fstart != null &&
      req.body.fend != null &&
      instructor != null &&
      req.body.tstart != null &&
      req.body.tend != null
    ) {
   
      await validateSaveSchedule(
        req.params.id,
        req.body.fiche,
        instructor,
        req.body.environment,
        req.body.fstart,
        req.body.fend,
        req.body.tstart,
        req.body.tend,
        req.body.events
      );
    }
  }),

  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
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
  check("tstart", "La hora de inicio es obligatoria").notEmpty(),
  check("tend", "La hora de fin es obligatoria").notEmpty(),
  check("tstart").custom(async (tstart, { req }) => {
    if (tstart != null && req.body.tend != null) {
      const currentDate = new Date()
      const tStartToDate = dateFormater(currentDate, tstart);
      const tEndToDate = dateFormater(currentDate, req.body.tend);

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
        throw new Error("Horas no validas");
      }
    }
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
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

scheduleVali.validateActiveSchedule = [
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


/**
 * Validation function for exist schedule.
 * @memberof scheduleVali
 * @function
 * @name validateExistSchedule
 * @param {Array} Array of validation checks.
 * @description This function validates the id and token when searching for a schedule by id.
 */

scheduleVali.validateExistSchedule = [
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
 * Validation function for the schedule headers.
 * @memberof scheduleVali
 * @function
 * @name validateScheduleHeaders
 * @param {Array} Array of validation checks.
 * @description This function validates the token when searching for a schedule by headers.
 */
scheduleVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { scheduleVali };
