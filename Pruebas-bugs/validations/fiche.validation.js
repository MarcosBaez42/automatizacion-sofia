/**
 * This module contains the validation functions for the fiche routes
 * @module validations/fiche.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/fiche.helper
 * @requires helpers/program.helper
 * @requires helpers/instructor.helper
 * @requires helpers/coordination.helper
 * @exports ficheVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { ficheHelper } from "../helpers/fiche.helper.js";
import { programHelper } from "../helpers/program.helper.js";
import { instrHelper } from "../helpers/instructor.helper.js";
import { coordinationHelper } from "../helpers/coordination.helper.js";

const { validateExistFicheById, uniqueNumberFiche,validateActiveFiche } = ficheHelper;
const { validateExistProgramById } = programHelper;
const { validateExistInstrById } = instrHelper;
const { validateExistCoordinationById } = coordinationHelper;
const { validateToken } = webToken;

/**
 * Object containing validation functions for fiche routes
 * @namespace ficheVali
 */
const ficheVali = {};

/**
 * Validation fields for registering a new fiche
 * @memberof ficheVali
 * @function validateRegisterFiche
 * @name validateRegisterFiche
 * @param {Array} Array of validation checks.
 * @description This function validates the number, program, owner, coordination, and token when registering a new fiche.
 */
ficheVali.validateRegisterFiche = [
  check("number", "El numero es obligatorio").notEmpty(),
  check("number").custom(async (number) => {
    await uniqueNumberFiche(number);
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("owner", "El lider de ficha es obligatorio").notEmpty(),
  check("owner", "El lider de ficha no es valido").isMongoId(),
  check("owner").custom(async (owner) => {
    await validateExistInstrById(owner);
  }),
  check("coordination", "La coordinación es obligatoria").notEmpty(),
  check("coordination", "La coordinación no es valida").isMongoId(),
  check("coordination").custom(async (coordination) => {
    await validateExistCoordinationById(coordination);
  }),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fstart", "La fecha de fin es obligatoria").notEmpty(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
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
 * Validation fields for updating an existing fiche
 * @memberof ficheVali
 * @function validateUpdateFiche
 * @name validateUpdateFiche
 * @param {Array} Array of validation checks.
 * @description This function validates the id, number, program, owner, coordination, and token when updating an existing fiche.
 */
ficheVali.validateUpdateFiche = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistFicheById(id);
  }),
  check("number", "El numero es obligatorio").notEmpty(),
  check("number").custom(async (number, { req }) => {
    await uniqueNumberFiche(number, req.params.id);
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("owner", "El lider de ficha es obligatorio").notEmpty(),
  check("owner", "El lider de ficha no es valido").isMongoId(),
  check("owner").custom(async (owner) => {
    await validateExistInstrById(owner);
  }),
  check("coordination", "La coordinación es obligatoria").notEmpty(),
  check("coordination", "La coordinación no es valida").isMongoId(),
  check("coordination").custom(async (coordination) => {
    await validateExistCoordinationById(coordination);
  }),
  check("fend", "La fecha de fin es obligatoria").notEmpty(),
  check("fstart", "La fecha de fin es obligatoria").notEmpty(),
  check("fstart").custom(async (fstart, { req }) => {
    if (fstart != null && req.body.fend != null) {
      if (new Date(fstart) <= new Date(req.body.fend)) {
        return true;
      }
    }
    throw new Error("La fecha de inicio no puede ser mayor a la fecha de fin");
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

ficheVali.validateActiveFiche = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveFiche(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];


/**
 * Validation fields for checking if a fiche exists
 * @memberof ficheVali
 * @function validateExistFiche
 * @name validateExistFiche
 * @param {Array} Array of validation checks.
 * @description This function validates the id and token when checking if a fiche exists.
 */
ficheVali.validateExistFiche = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistFicheById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

/**
 * Validation fields for checking the token in the headers
 * @memberof ficheVali
 * @function validateHeaders
 * @name validateHeaders
 * @param {Array} Array of validation checks.
 * @description This function validates the token in the headers.
 */
ficheVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

export { ficheVali };
