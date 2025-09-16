/**
 *
 * This module exports an object containing validation functions for reports, instructors, fiches, and temporary tokens.
 * @module reportsVali
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/fiche.helper
 * @exports reportsVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { ficheHelper } from "../helpers/fiche.helper.js";
import { instrHelper } from "../helpers/instructor.helper.js";
import { environmentHelper } from "../helpers/environment.helper.js";

const {
  validateExistFicheById,
  validateExistFicheByNumber,
} = ficheHelper;
const { validateInfoInst,validateExistInstById } = instrHelper;
const { validateExistEnvironmentById } = environmentHelper;
const { validateToken, validateTempToken } = webToken;

const reportsVali = {};

/**
 * Validates the fields for a report.
 * @function
 * @name validateReport
 * @memberof module:reportsVali
 * @param {Array} An array of validation middleware functions.
 * @description This function validates the fiche, the start date, the end date, and the token when creating a report for a fiche.
 */
reportsVali.validateReport = [
  check("fiche", "La fiche es obligatoria").notEmpty(),
  check("fiche", "La fiche no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    const dateStart = new Date(fstart)
    const dateEnd = new Date(req.body.fend)
    if (fstart != null && req.body.fend != null) {
      if (dateStart <= dateEnd) {
        return true;
      }
      //la diferencia entre fechas no puede ser mayor a 8 meses
      if (Math.abs(dateStart.getMonth() - dateEnd.getMonth()) > 10) {
        throw new Error("La diferencia entre fechas no puede ser mayor a 10 meses");
      }
    }

    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

/**
 * Validates the fields for a report related to an instructor.
 * @function
 * @name validateReportInstr
 * @memberof module:reportsVali
 * @param {Array} An array of validation middleware functions.
 * @description This function validates the instructor, the start date, the end date, and the token when creating a report for an instructor.
 */
reportsVali.validateReportInstr = [
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstById(instructor);
  }),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    const dateStart = new Date(fstart)
    const dateEnd = new Date(req.body.fend)
    if (fstart != null && req.body.fend != null) {
      if (dateStart <= dateEnd) {
        return true;
      }
      //la diferencia entre fechas no puede ser mayor a 8 meses
      if (Math.abs(dateStart.getMonth() - dateEnd.getMonth()) > 10) {
        throw new Error("La diferencia entre fechas no puede ser mayor a 10 meses");
      }
    }

    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];


reportsVali.validateReporEnvironment = [
  check("environment", "El ambiente es obligatorio").notEmpty(),
  check("environment", "El ambiente no es valido").isMongoId(),
  check("environment").custom(async (environment) => {
    await validateExistEnvironmentById(environment);
  }),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    const dateStart = new Date(fstart)
    const dateEnd = new Date(req.body.fend)
    if (fstart != null && req.body.fend != null) {
      if (dateStart <= dateEnd) {
        return true;
      }
      //la diferencia entre fechas no puede ser mayor a 8 meses
      if (Math.abs(dateStart.getMonth() - dateEnd.getMonth()) > 10) {
        throw new Error("La diferencia entre fechas no puede ser mayor a 10 meses");
      }
    }

    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];




/**
 * Validates the fields for a report using a temporary token.
 * @function
 * @name validateReportTemp
 * @memberof module:reportsVali
 * @param {Array} An array of validation middleware functions.
 * @description This function validates the fiche, the start date, the end date, and the token when creating a report for a fiche using a temporary token.
 */
reportsVali.validateReportTemp = [
  check("fiche", "La fiche es obligatoria").notEmpty(),
  check("fiche", "La fiche no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    const dateStart = new Date(fstart)
    const dateEnd = new Date(req.body.fend)
    if (fstart != null && req.body.fend != null) {
      if (dateStart <= dateEnd) {
        return true;
      }
      //la diferencia entre fechas no puede ser mayor a 8 meses
      if (Math.abs(dateStart.getMonth() - dateEnd.getMonth()) > 10) {
        throw new Error("La diferencia entre fechas no puede ser mayor a 10 meses");
      }
    }

    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("token").custom(async (token) => {
    await validateTempToken(token);
  }),
  validateFields,
];

/**
 * Validates the fields for an instructor.
 * @function
 * @name validateInstr
 * @memberof module:reportsVali
 * @param {Array} An array of validation middleware functions.
 * @description This function validates the document, the email, and the token when creating a report for an instructor.
 */
reportsVali.validateInstr = [
  check("document", "El documento es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("document").custom(async (document, { req }) => {
    await validateInfoInst(document, req.body.email);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];


reportsVali.validateReportHours =  [
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fstart", "La fecha de inicio no es valida").isDate(),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fend", "La fecha de fin no es valida").isDate(),
  check("fstart").custom(async (fstart, { req }) => {
    const dateStart = new Date(fstart)
    const dateEnd = new Date(req.body.fend)
    if (fstart != null && req.body.fend != null) {
      if (dateStart <= dateEnd) {
        return true;
      }
    }

    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("type", "El tipo de reporte es obligatorio").notEmpty(),
  check("type", "El tipo de reporte no es valido").isIn(["EN FORMACION", "OTRAS ACTIVIDADES", "TODOS"]),
  check("token").custom(async (token) => {
    await validateTempToken(token);
  }),
  validateFields,
];

/**
 * Validates the fields for a fiche.
 * @function
 * @name validateFiche
 * @memberof module:reportsVali
 * @param {Array} An array of validation middleware functions.
 * @description This function validates the fiche and the token when creating a report for a fiche.
 */
reportsVali.validateFiche = [
  check("fiche", "La fiche es obligatoria").notEmpty(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheByNumber(fiche);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

export { reportsVali };
