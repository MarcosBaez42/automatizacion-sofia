/**
 * This module exports an object containing validation functions for outcomes.
 * @module outcome.validation.js
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/outcome.helper
 * @requires helpers/competence.helper
 * @exports outcomeVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { outcomeHelper } from "../helpers/outcome.helper.js";
import { competenceHelper } from "../helpers/competence.helper.js";

const {
  validateExistOutcomeById,
  validateExistOutcomeBycode,
  validateExistOutcomeByCodeUpdate,
  validateActiveOutcome
} = outcomeHelper;
const { validateExistCompetenceById } = competenceHelper;
const { validateToken } = webToken;

const outcomeVali = {};

/**
 * Validates the fields for getting the outcomes of a competence.
 * @function
 * @name validateCompOut
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - If the id of the competence is not provided or is not valid.
 * @throws {Error} - If the competence does not exist.
 * @throws {Error} - If the token is not valid.
 * @description This function validates the id of the competence and the token when getting the outcomes of a competence.
 */
outcomeVali.validateCompOut = [
  check("id", "El id de la competencia es obligatorio").notEmpty(),
  check("id", "El id de la competencia no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistCompetenceById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token,false);
  }),
  validateFields,
];

/**
 * Validates the fields for registering an outcome.
 * @function
 * @name validateRegisterOutcome
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - If the outcomes are not valid.
 * @throws {Error} - If the outcomes array is empty.
 * @throws {Error} - If the name or code of an outcome is not provided.
 * @throws {Error} - If the codes of the outcomes are repeated.
 * @throws {Error} - If the competence does not exist.
 * @throws {Error} - If the token is not valid.
 * @description This function validates the outcomes, the competence, and the token when registering an outcome.
 */
outcomeVali.validateRegisterOutcome = [
  check("outcomes", "Los resultados no son validos").isArray(),
  check("outcomes").custom(async (outcomes, { req }) => {
    if (outcomes.length < 1) {
      throw new Error("Los resultados son obligatorios");
    }
    outcomes.forEach((outcome) => {
      if (!outcome.name) {
        throw new Error("El nombre de los resultados es obligatorio");
      }
      if (!outcome.code) {
        throw new Error("El codigo de los resultados es obligatorio");
      }

      //VALIDAR QUE EL CODIGO DEL RESULTADO SEAN SOLO NUMEROS SIN NINGUNA LETRA O CARACTER ESPECIAL
      const regex = /^[0-9]*$/;
      if (!regex.test(outcome.code)) {
        throw new Error("El codigo no puede contener letras o caracteres especiales");
      }

      
    });

    //validar que no se repitan los codigos
    const codes = outcomes.map((outcome) => outcome.code);
    const uniqueCodes = [...new Set(codes)];
    if (codes.length !== uniqueCodes.length) {
      throw new Error("Los codigos no pueden repetirse");
    }

    await validateExistOutcomeBycode(codes, req.body.competence, req);
  }),

  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (program) => {
    await validateExistCompetenceById(program);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates the fields for updating an outcome.
 * @function
 * @name validateUpdateOutcome
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - If the outcome id is not provided or is not valid.
 * @throws {Error} - If the outcome does not exist.
 * @throws {Error} - If the outcome code is repeated.
 * @throws {Error} - If the competence does not exist.
 * @throws {Error} - If the token is not valid.
 * @description This function validates the id of the outcome, the outcome, the competence, and the token when updating an outcome.
 */
outcomeVali.validateUpdateOutcome = [
  check("outcome", "El outcome es obligatorio").notEmpty(),
  check("outcome", "El outcome no es valido").isMongoId(),
  check("outcome").custom(async (id, { req }) => {
    await validateExistOutcomeById(id);
    await validateExistOutcomeByCodeUpdate(
      req.body.code,
      req.body.competence,
      id
    );
  }),

  check("name", "El nombre es obligatorio").notEmpty(),
  check("code", "El codigo es obligatorio").notEmpty(),
  check("code").custom(async (code) => {
    const regex = /^[0-9]*$/;
    if (!regex.test(code)) {
      throw new Error("El codigo no puede contener letras o caracteres especiales");
    }
  }),

  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (program) => {
    await validateExistCompetenceById(program);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

/**
 * Validates the existence of an outcome.
 * @function
 * @name validateExistOutcome
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - If the outcome id is not provided or is not valid.
 * @throws {Error} - If the outcome does not exist.
 * @throws {Error} - If the token is not valid.
 * @description This function validates the id of the outcome and the token when checking the existence of an outcome.
 */
outcomeVali.validateExistOutcome = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistOutcomeById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

outcomeVali.validateActiveOutcome = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateActiveOutcome(id);
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
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - If the token is not valid.
 * @description This function validates the token in the headers.
 */
outcomeVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { outcomeVali };
