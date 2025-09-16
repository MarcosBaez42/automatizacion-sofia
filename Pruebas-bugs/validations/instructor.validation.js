/**
 * This module exports an object containing validation functions for instructors.
 * @module validations/instructor.validation.js
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/instructor.helper
 * @exports instructorVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { instrHelper } from "../helpers/instructor.helper.js";

const {
  validateEmailUnique,
  validateEmailPersonalUnique,
  validateDocuUnique,
  validateExistInstrById,
  validateActiveInstr,
  validateExistEmail
} = instrHelper;
const { validateToken ,validateTokenInst} = webToken;

const instructorVali = {};
const tpdocuments = ["CC", "CE", "NIT", "PASAPORTE"];


/**
 * Validates if an email exists.
 * @function
 * @name validateEmail
 * @memberof module:validations/users.validation
 * @param {Array} Array of validation middleware functions.
 * @description This function validates the email when checking if an email exists.
 */
instructorVali.validateEmail = [
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email) => {
    await validateExistEmail(email);
  }),
  validateFields,
];


/**
 * Validation middleware for registering a new instructor
 * @memberof instructorVali
 * @function
 * @name validateRegisterInstr
 * @param {Array} Array of validation checks.
 * @description This function validates the name, type of document, number of document, personal email, email, phone, knowledge, thematic area, and token when registering a new instructor.
 */
instructorVali.validateRegisterInstr = [
  check("name", "El nombre es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(tpdocuments),
  check("numdocument", "El numero de documento es obligatorio").notEmpty(),
  check(
    "numdocument",
    "El numero de documento debe tener minimo 6 caracteres y maximo 20"
  ).isLength({ min: 6, max: 20 }),
  check("numdocument").custom(async (numdocument, { req }) => {
    console.log(req.body);
    await validateDocuUnique(numdocument);
  }),
  check("emailpersonal", "El email personal es obligatorio").notEmpty(),
  check("emailpersonal", "El email personal no es valido").isEmail(),
  check("emailpersonal").custom(async (emailpersonal) => {
    await validateEmailPersonalUnique(emailpersonal);
  }),

  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email) => {
    await validateEmailUnique(email);
  }),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check(
    "phone",
    "El telefono debe tener minimo 6 caracteres y maximo 20"
  ).isLength({ min: 6, max: 20 }),
  check("knowledge", "La red de conocimiento es obligatoria").notEmpty(),
  check("thematicarea", "El area tematica es obligatoria").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation middleware for updating an existing instructor
 * @memberof instructorVali
 * @function
 * @name validateUpdateInstr
 * @param {Array} Array of validation checks.
 * @description This function validates the id, name, type of document, number of document, personal email, email, phone, knowledge, thematic area, and token when updating an existing instructor.
 */

instructorVali.validateUpdateInstr = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistInstrById(id);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(tpdocuments),
  check("numdocument", "El numero de documento es obligatorio").notEmpty(),
  check(
    "numdocument",
    "El numero de documento debe tener minimo 6 caracteres y maximo 20"
  ).isLength({ min: 6, max: 20 }),
  check("numdocument").custom(async (numdocument, { req }) => {
    await validateDocuUnique(numdocument, req.params.id);
  }),
  check("emailpersonal", "El email personal es obligatorio").notEmpty(),
  check("emailpersonal", "El email personal no es valido").isEmail(),
  check("emailpersonal").custom(async (emailpersonal, { req }) => {
    await validateEmailPersonalUnique(emailpersonal, req.params.id);
  }),

  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("email").custom(async (email, { req }) => {
    await validateEmailUnique(email, req.params.id);
  }),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check(
    "phone",
    "El telefono debe tener minimo 6 caracteres y maximo 20"
  ).isLength({ min: 6, max: 20 }),
  check("knowledge", "La red de conocimiento es obligatoria").notEmpty(),
  check("thematicarea", "El area tematica es obligatoria").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];
instructorVali.validateActiveInstr = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveInstr(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];


/**
 * Validation middleware for checking if an instructor exists by ID
 * @memberof instructorVali
 * @function
 * @name validateExistInstr
 * @param {Array} Array of validation checks.
 * @description This function validates the id and token when checking if an instructor exists by ID.
 */
instructorVali.validateExistInstr = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistInstrById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validation middleware for checking the token in the headers
 * @memberof instructorVali
 * @function
 * @name validateHeaders
 * @param {Array} Array of validation checks.
 * @description This function validates the token in the headers.
 */
instructorVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

instructorVali.validatetokenloginInstru= [
  check("token").custom(async (token) => {
    await validateTokenInst(token);
  }),
  validateFields,
];

export { instructorVali };
