/**
 * This module exports an object containing validation functions for the competence model.
 * @module competenceVali
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/competence.helper
 * @requires helpers/program.helper
 * @exports competenceVali
 */
import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { competenceHelper } from "../helpers/competence.helper.js";
import { programHelper } from "../helpers/program.helper.js";

const { validateExistCompetenceById, validateExistCompetenceByNumber,validateActiveCompetence } =
  competenceHelper;
const { validateExistProgramById } = programHelper;

const { validateToken } = webToken;

const competenceVali = {};

/**
 * Validates the fields for getting the competences of a program.
 * @function
 * @name validateExistCompetenceProgram
 * @memberof module:validations/competence.validation
 * @inner
 * @param {Array} Array of validation checks.
 * @description This function validates the id of the program and the token when getting the competences of a program.
 */
competenceVali.validateExistProgram = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistProgramById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token,false);
  }),
  validateFields,
];

/**
 * Validates the fields for registering a competence.
 * @function
 * @name validateRegisterCompetence
 * @memberof module:validations/competence.validation
 * @inner
 * @param {Array} Array of validation checks.
 * @description This function validates the name, number, program, and token when registering a competence.
 */
competenceVali.validateRegisterCompetence = [
  check("name", "El nombre es obligatorio").notEmpty(),
  check("number", "El numero es obligatorio").notEmpty(),
  check("number").custom(async (number, { req }) => {
    await validateExistCompetenceByNumber(number, req.body.program);

    //VALIDAR QUE EL CODIGO DE LA COMPETENCIA NO CONTENGA LETRAS O CARACTERES ESPECIALES
    const regex = /^[0-9]*$/;
    if (!regex.test(number)) {
      throw new Error(
        "El numero de la competencia no puede contener letras o caracteres especiales"
      );
    }
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),

  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates the fields for updating a competence.
 * @function
 * @name validateUpdateCompetence
 * @memberof module:validations/competence.validation
 * @inner
 * @param {Array} Array of validation checks.
 * @description This function validates the id, name, number, program, and token when updating a competence.
 */
competenceVali.validateUpdateCompetence = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistCompetenceById(id);
  }),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("number", "El numero es obligatorio").notEmpty(),
  check("number").custom(async (number, { req }) => {
    await validateExistCompetenceByNumber(
      number,
      req.body.program,
      req.params.id
    );

    //VALIDAR QUE EL CODIGO DE LA COMPETENCIA NO CONTENGA LETRAS O CARACTERES ESPECIALES
    const regex = /^[0-9]*$/;
    if (!regex.test(number)) {
      throw new Error(
        "El numero de la competencia no puede contener letras o caracteres especiales"
      );
    }
  }),
  check("program", "El programa es obligatorio").notEmpty(),
  check("program", "El programa no es valido").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

competenceVali.validateActiveCompetence = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveCompetence(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];



/**
 * Validates the fields for checking the existence of a competence.
 * @function
 * @name validateExistCompetence
 * @memberof module:validations/competence.validation
 * @inner
 * @param {Array} Array of validation checks.
 * @description This function validates the id and token when checking the existence of a competence.
 */
competenceVali.validateExistCompetence = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistCompetenceById(id);
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
 * @memberof module:validations/competence.validation
 * @inner
 * @param {Array} Array of validation checks.
 * @description This function validates the token in the headers.
 */
competenceVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { competenceVali };
