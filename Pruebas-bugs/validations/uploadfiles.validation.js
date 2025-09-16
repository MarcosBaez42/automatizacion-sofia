/**
 * @fileoverview It contains the validations for the file upload routes.
 * @module validations/uploadfiles.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/uploadfiles.helper
 * @requires helpers/program.helper
 * @exports validateFile
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { fileHelper } from "../helpers/uploadfiles.helper.js";
import { programHelper } from "../helpers/program.helper.js";

const { validateToken } = webToken;
const { generateInfoOfExcel,generateInfoOfExcelInst } = fileHelper;
const { validateExistProgramById } = programHelper;

/**
 * Object containing validation functions for file uploads.
 * @namespace validateFile
 */
const validateFile = {};

/**
 * Validation function for Excel files.
 * @memberof validateFile
 * @function
 * @name validateExcel
 * @param {Array} Array of validation checks.
 * @description This function validates the program, the file, and the token when uploading an Excel file for register the competences and outcomes.
 */
validateFile.validateExcel = [
  check("program", "El programa es obligatorio").isMongoId(),
  check("program").custom(async (program) => {
    await validateExistProgramById(program);
  }),
  check("fileExcel").custom(async (value, { req }) => {

    if (!req.files) {
      throw new Error("No se ha cargado ningún archivo");
    }

    const file = req.files.file;

    if (!file) {
      throw new Error("No se ha cargado ningún archivo");
    }

    const nameFile = file.name;
    const extension = nameFile.split(".").pop();
    if (extension !== "xlsx") {
      throw new Error("El archivo debe ser de tipo xlsx");
    }

    await generateInfoOfExcel(file, req);

    return true;
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];


validateFile.validateExcelInstructor = [
  check("fileExcel").custom(async (value, { req }) => {

    if (!req.files) {
      throw new Error("No se ha cargado ningún archivo");
    }

    const file = req.files.file;

    if (!file) {
      throw new Error("No se ha cargado ningún archivo");
    }

    const nameFile = file.name;
    const extension = nameFile.split(".").pop();
    if (extension !== "xlsx" && extension !== "xls"  && extension !== "xlsm") {
      throw new Error("El archivo debe ser de tipo xlsx, xls, xlsm");
    }

    await generateInfoOfExcelInst(file, req);

    return true;
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];


/**
 * Validation function for Excel judgment files.
 * @memberof validateFile
 * @function
 * @name validateExcelJudgment
 * @param {Array} Array of validation checks.
 * @description This function validates the file and the token when uploading an Excel file for register the judgments.
 */
validateFile.validateExcelJudgment = [
  check("fileJudgment").custom(async (value, { req }) => {
    if (!req.files) {
      throw new Error("No se ha cargado ningún archivo");
    }

    const file = req.files.file;

    if (!file) {
      throw new Error("No se ha cargado ningún archivo");
    }

    const nameFile = file.name;
    const extension = nameFile.split(".").pop();
    if (extension !== "xlsx" && extension !== "xls" && extension !== "xlsm") {
      throw new Error("El archivo debe ser de tipo xlsx, xls, xlsm");
    }

    return true;
  }),
  check("token").custom(async (token) => {
    await validateToken(token, null, null, true,true);
  }),

  validateFields,
];

/**
 * Validation function for file headers.
 * @memberof validateFile
 * @function
 * @name validateHeader
 * @param {Array} Array of validation checks.
 * @description This function validates the token .
 */
validateFile.validateHeader = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { validateFile };
