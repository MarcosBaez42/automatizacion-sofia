/**
 * @fileoverview It contains validation functions for program-related routes
 * @module validations/program.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/program.helper
 * @exports programVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { programHelper } from "../helpers/program.helper.js";

const { validateExistProgramById,uniqueCodeProgram,validateActiveProgram } = programHelper;
const { validateToken } = webToken;

/**
 * Object containing validation functions for program-related routes
 * @namespace programVali
 */
const programVali = {};

/**
 * Validation function for registering a new program
 * @function validateRegisterProgram
 * @memberof programVali
 * @param {Array} Array of validation middleware functions
 * @description This function validates the code, name, version, and token when registering a new program
 */
programVali.validateRegisterProgram = [
  check("code", "El codigo es obligatorio").notEmpty(),
  check("code").custom(async (code, { req }) => {
    await uniqueCodeProgram(code, req.body.version);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("version", "La version del programa es obligatoria").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for updating an existing program
 * @function validateUpdateProgram
 * @memberof programVali
 * @param {Array} Array of validation middleware functions
 * @description This function validates the id, code, name, version, and token when updating an existing program
 */
programVali.validateUpdateProgram = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistProgramById(id);
  }),
  check("code", "El codigo es obligatorio").notEmpty(),
  check("code").custom(async (code, { req }) => {
    await uniqueCodeProgram(code,req.body.version, req.params.id);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("version", "La version del programa es obligatoria").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation function for checking if a program exists
 * @function validateExistProgram
 * @memberof programVali
 * @param {Array} Array of validation middleware functions
 * @description This function validates the id and token when checking if a program exists
 */
programVali.validateExistProgram = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistProgramById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

programVali.validateActiveProgram = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveProgram(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];


/**
 * Validation function for checking the token in the request headers
 * @function validateHeaders
 * @memberof programVali
 * @param {Array} Array of validation middleware functions
 * @description This function validates the token in the request headers
 */
programVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { programVali };
