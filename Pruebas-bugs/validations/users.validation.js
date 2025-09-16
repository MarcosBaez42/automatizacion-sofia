/**
 * This module exports an object with validation functions for user-related routes.
 * @module validations/users.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @exports usersVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { userHelper } from "../helpers/user.helper.js";
import { coordinationHelper } from "../helpers/coordination.helper.js";

const {
  validateEmailUnique,
  validateExistUserById,
  validateExistEmail,
  checkUserActive,
} = userHelper;

const { validateExistCoordinationById } = coordinationHelper;

const { validateToken, tokenResetPass } = webToken;

const usersVali = {};

const roles = ["ADMIN", "USER","ETAPA PRODUCTIVA"];
const rolesRegister = ["PROGRAMADOR", "COORDINADOR", "EVALUADOR", "NOVEDADES","ETAPA PRODUCTIVA"];

/**
 * Validates fields for registering a user.
 * @function
 * @name validateRegisterUser
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the name, email, password, role, and token when registering a user.
 */
usersVali.validateRegisterUser = [
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email) => {
    await validateEmailUnique(email);
  }),
  check("password", "La contraseña es obligatoria").notEmpty(),
  check("password", "La contraseña debe tener minimo 6 caracteres y maximo 20"),
  check("role", "El rol es obligatorio").notEmpty(),
  check("role", "El rol no es valido").isIn(rolesRegister),
  check("coordinations").custom(async (coordinations, { req }) => {
    if (coordinations.length > 0 && req.body.role === "NOVEDADES") {
      for (let i = 0; i < coordinations.length; i++) {
        await validateExistCoordinationById(coordinations[i]);
      }
    } else if (req.body.role === "NOVEDADES" && coordinations.length === 0) {
      throw new Error("Las coordinaciones son obligatorias");
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
  validateFields,
];

/**
 * Validates fields for updating a user.
 * @function
 * @name validateUpdateUser
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the id, name, email, password, role, and token when updating a user.
 */
usersVali.validateUpdateUser = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistUserById(id);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email, { req }) => {
    await validateEmailUnique(email, req.params.id);
  }),
  check("password", "La contraseña es obligatoria").notEmpty(),
  check(
    "password",
    "La contraseña debe tener minimo 6 caracteres y maximo 20"
  ).isLength({ min: 6, max: 20 }),
  check("role", "El rol es obligatorio").notEmpty(),
  check("role", "El rol no es valido").isIn(rolesRegister),
  check("coordinations").custom(async (coordinations, { req }) => {
    if (coordinations.length > 0 && req.body.role === "NOVEDADES") {
      for (let i = 0; i < coordinations.length; i++) {
        await validateExistCoordinationById(coordinations[i]);
      }
    } else if (req.body.role === "NOVEDADES" && coordinations.length === 0) {
      throw new Error("Las coordinaciones son obligatorias");
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
  validateFields,
];

/**
 * Validates fields for logging in a user.
 * @function
 * @name validateLoginUser
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the role when logging in a user.
 */
usersVali.validateLoginUser = [
  check("role", "El rol es obligatorio").notEmpty(),
  check("role", "El rol no es valido").isIn(roles),

  validateFields,
];

/**
 * Validates if a user exists.
 * @function
 * @name validateExistUser
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the id and token when checking if a user exists.
 */
usersVali.validateExistUser = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
   
    await validateExistUserById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

usersVali.validateActiveUser = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistUserById(id);
    await checkUserActive(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates if an email exists.
 * @function
 * @name validateEmail
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the email when checking if an email exists.
 */
usersVali.validateEmail = [
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email) => {
    await validateExistEmail(email);
  }),
  validateFields,
];

/**
 * Validates changing a user's password.
 * @function
 * @name validateChangePassword
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the token and password when changing a user's password.
 */
usersVali.validateChangePassword = [
  check("token").custom(async (token) => {
    await tokenResetPass(token);
  }),
  check("password", "La contraseña es obligatoria").notEmpty(),
  check(
    "password",
    "La contraseña debe tener minimo 6 caracteres y maximo 20"
  ).isLength({ min: 6, max: 20 }),

  validateFields,
];

/**
 * Validates a token.
 * @function
 * @name validateHeaders
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the token when validating a token.
 */
usersVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates a token for a superuser.
 * @function
 * @name validateHeadersSuper
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the token when validating a token for a superuser.
 */
usersVali.validateHeadersSuper = [
  
  check("token").custom(async (token) => {
 
    await validateToken(token, true, true);
  
  }),

];

usersVali.validatetokenloginuser= [
  check("token").custom(async (token) => {
    await validateToken(token, true, true);
  }),
  validateFields,
];

export { usersVali };
