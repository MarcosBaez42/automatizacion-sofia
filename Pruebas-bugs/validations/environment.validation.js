/**
 * This module exports an object containing validation functions for environment-related routes.
 * @module validations/environment.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/environment.helper
 * @exports environmentVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { environmentHelper } from "../helpers/environment.helper.js";

const { validateExistEnvironmentById,validateExistEnvironmentByName, validateExistTown } = environmentHelper;
const { validateToken } = webToken;

const environmentVali = {};

/**
 * Validates fields for registering an environment.
 * @function
 * @name validateRegisterEnvironment
 * @memberof module:validations/environment.validation
 * @param {Array} Array of validation checks.
 * @description This function validates the name, town, and token when registering an environment.
 */
environmentVali.validateRegisterEnvironment = [
  check("name", "El nombre es obligatorio").notEmpty(),
  check("name").custom(async (name,{req}) => {
    await validateExistEnvironmentByName(name,req.body.town);
  }),
  check("town", "El municipio o ciudad es obligatorio").notEmpty(),
  check("town", "El municipio o ciudad no es valido").isMongoId(),
  check("town").custom(async (town) => {
    await validateExistTown(town);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates fields for updating an environment.
 * @function
 * @name validateUpdateEnvironment
 * @memberof module:validations/environment.validation
 * @param {Array} Array of validation checks.
 * @description This function validates the id, name, town, and token when updating an environment.
 */
environmentVali.validateUpdateEnvironment = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistEnvironmentById(id);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("name").custom(async (name, { req }) => {
    await validateExistEnvironmentByName(name,req.body.town,req.params.id);
  }),
  check("town", "El municipio o ciudad es obligatorio").notEmpty(),
  check("town", "El municipio o ciudad no es valido").isMongoId(),
  check("town").custom(async (town) => {
    await validateExistTown(town);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates if an environment exists.
 * @function
 * @name validateExistEnvironment
 * @memberof module:validations/environment.validation
 * @param {Array} Array of validation checks.
 * @description This function validates the id and token when checking if an environment exists.
 */
environmentVali.validateExistEnvironment = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistEnvironmentById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates the token in the headers.
 * @function
 * @name validateHeaders
 * @memberof module:validations/environment.validation
 * @param {Array} Array of validation checks.
 * @description This function validates the token in the headers.
 */
environmentVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { environmentVali };
