/**
 * @fileoverview This module exports an object with validation functions for coordination data.
 * @module validations/coordination.validation
 * @requires express-validator
 * @requires ../middlewares/webToken
 * @requires ../middlewares/validateFields
 * @requires ../helpers/coordination.helper
 * @exports coordinationVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { coordinationHelper } from "../helpers/coordination.helper.js";

const {
  validateExistCoordinationById,
  validateExistCoordinator,
  validateExistprogrammer,
  validateExistEmail,
  validateActiveCoordination,
} = coordinationHelper;
const { validateToken } = webToken;

const coordinationVali = {};
const modalities = ["PROGRAMAS ESPECIALES", "VIRTUAL", "TITULADA"];

/**
 * Validates fields for registering a coordination.
 * @function
 * @name validateRegisterCoordination
 * @memberof module:validations/coordination.validation
 * @inner
 * @param {Array} Array of express-validator middleware functions.
 * @description This function validates the name, coordinator, modality, email, password, and token when registering a new coordination.
 */
coordinationVali.validateRegisterCoordination = [
  check("name", "El nombre es obligatorio").notEmpty(),
  check("coordinator", "El coordinador es obligatorio").notEmpty(),
  check("coordinator", "El coordinador no es valido").isMongoId(),
  check("coordinator").custom(async (coordinator) => {
    await validateExistCoordinator(coordinator);
  }),
  check("programmers", "Los programadores son obligatorios").notEmpty(),
  check("programmers", "Los programadores no son validos").isArray(),
  check("programmers").custom(async (programmers) => {
    if (programmers.length > 0) {
      await validateExistprogrammer(programmers);
    } else {
      throw new Error("Los programadores son obligatorios");
    }
  }),
  check("modality", "La modalidad es obligatoria").notEmpty(),
  check("modality", "La modalidad no es valida").isIn(modalities),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email) => {
    await validateExistEmail(email);
  }),
  check("namefoldernew", "El nombre de la carpeta de drive es obligatorio").notEmpty(),
  check("passapp", "La contraseña es obligatoria").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
  validateFields,
];

/**
 * Validates fields for updating a coordination.
 * @function
 * @name validateUpdateCoordination
 * @memberof module:validations/coordination.validation
 * @inner
 * @param {Array} Array of express-validator middleware functions.
 * @description This function validates the id, name, coordinator, modality, email, password, and token when updating a coordination.
 */
coordinationVali.validateUpdateCoordination = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistCoordinationById(id);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("coordinator", "El coordinador es obligatorio").notEmpty(),
  check("coordinator", "El coordinador no es valido").isMongoId(),
  check("coordinator").custom(async (coordinator) => {
    await validateExistCoordinator(coordinator);
  }),
  check("programmers", "Los programadores son obligatorios").notEmpty(),
  check("programmers", "Los programadores no son validos").isArray(),
  check("programmers").custom(async (programmers) => {
    if (programmers.length > 0) {
      await validateExistprogrammer(programmers);
    } else {
      throw new Error("Los programadores son obligatorios");
    }
  }),

  check("modality", "La modalidad es obligatoria").notEmpty(),
  check("modality", "La modalidad no es valida").isIn(modalities),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email, { req }) => {
    await validateExistEmail(email, req.params.id);
  }),
  check("passapp", "La contraseña es obligatoria").notEmpty(),
  check("namefoldernew", "El nombre de la carpeta de drive es obligatorio").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
  validateFields,
];

coordinationVali.validateActiveCoordination = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistCoordinationById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
  validateFields,
];

/**
 * Validates if a coordination exists.
 * @function
 * @name validateExistCoordination
 * @memberof module:validations/coordination.validation
 * @inner
 * @param {Array} Array of express-validator middleware functions.
 * @description This function validates the id and token when checking the existence of a coordination.
 */
coordinationVali.validateExistCoordination = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveCoordination(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates token in headers.
 * @function
 * @name validateHeaders
 * @memberof module:validations/coordination.validation
 * @inner
 * @param {Array} Array of express-validator middleware functions.
 * @description This function validates the token in the headers.
 */
coordinationVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates token in headers for super users.
 * @function
 * @name validateHeadersSuper
 * @memberof module:validations/coordination.validation
 * @inner
 * @param {Array} Array of express-validator middleware functions.
 * @description This function validates the token in the headers for super users.
 */
coordinationVali.validateHeadersSuper = [
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
];

export { coordinationVali };
