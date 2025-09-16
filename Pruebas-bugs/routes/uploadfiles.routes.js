import { Router } from "express";
import { fileCtrl } from "../controller/uploadfiles.controller.js";
import { validateFile } from "../validations/uploadfiles.validation.js";

/**
 * Controller functions for file upload and download
 * @namespace fileCtrl
 * @property {function} readExcel - Reads and processes uploaded Excel file
 * @property {function} downloadExample - Downloads an example Excel file
 * @property {function} readExcelJudgment - Reads and processes uploaded Excel file for judgment
 * @property {function} generateSummaryExcel - Generates summary Excel file of competences and outcomes
 */

const { readExcel, downloadExample, readExcelJudgment,generateSummaryExcel,getTowns,readExcelInstructor } = fileCtrl;

/**
 * Validation functions for file upload
 * @namespace validateFile
 * @property {function} validateExcel - Validates uploaded Excel file
 * @property {function} validateHeader - Validates uploaded Excel file header
 * @property {function} validateExcelJudgment - Validates uploaded Excel file for judgment
 */

const { validateExcel,validateExcelInstructor, validateHeader, validateExcelJudgment } = validateFile;

const routerUploads = Router();

routerUploads.post("/downloadexcel", validateHeader, downloadExample);
routerUploads.get("/generatesummary", generateSummaryExcel);
routerUploads.get("/towns",validateHeader, getTowns);
routerUploads.post("/uploadexcel/:program", validateExcel, readExcel);
routerUploads.post("/uploadexcelinstructor", validateExcelInstructor, readExcelInstructor);
routerUploads.post(
  "/uploadexceljudgment",
  validateExcelJudgment,
  readExcelJudgment
);



export { routerUploads };
