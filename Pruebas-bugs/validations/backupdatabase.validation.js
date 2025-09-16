/**
 * This module contains validation methods for backup database routes.
 * @module validations/backupdatabase.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @exports backupdatabasVali
 */
import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";

const { validateTokenSuper } = webToken;

/**
 * Object containing validation methods for backup database routes.
 * @namespace backupdatabasVali
 */
const backupdatabasVali = {};

/**
 * Validation method for the token.
 * @memberof backupdatabasVali
 * @function validateToken
 * @name validateToken
 * @param {Array} Array of validation checks.
 * @description This function validates the token when backing up the database.
 */
backupdatabasVali.validateToken = [
  check("token").custom(async (token) => {
    await validateTokenSuper(token);
  }),
  validateFields,
];

export { backupdatabasVali };
