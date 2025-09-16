import { Router } from "express";
import { reportsCtrl } from "../controller/reports.controller.js";
import { reportsVali } from "../validations/reports.validation.js";

/**
 * Controller functions containing validation functions for report registration, existence, update, and headers.
 * @typedef {Object} ReportsValidation
 * @property {Function} validateReport - Validates report registration credentials.
 * @property {Function} validateReportInstr - Validates report registration credentials.
 * @property {Function} validateInstr - Validates report registration credentials for instructor.
 * @property {Function} validateFiche - Validates report registration credentials for fiche.
 * @property {Function} validateReportTemp - Validates report registration credentials.

 */

const {
  validateReport,
  validateReportInstr,
  validateInstr,
  validateFiche,
  validateReportTemp,
  validateReporEnvironment,
  validateReportHours
} = reportsVali;

/**
 * Validation functions functions for getting report ID, registering, getting reports, getting report data, getting report fiche, getting report data for editing, getting reports with limit, updating, activating, deactivating, and deleting event.
 * @typedef {Object} ReportsController
 * @property {Function} newReport - Registers report.
 * @property {Function} newReportInstructor - Registers report for instructor.
 * @property {Function} responseInstr - Validates report registration credentials for instructor.
 * @property {Function} responseFiche - Validates report registration credentials for fiche.
 * @property {Function} sendReport - Validates report before sending.
 * @property {Function} testEmail - test send report.
 * @property {Function} testEmailMicrosoft - test send report microsoft.
 */
const {
  newReport,
  newReportInstructor,
  responseInstr,
  responseFiche,
  sendReport,
  testEmail,
  testEmailMicrosoft,
  newReportEnvironment,
  reportHoursInstructors
} = reportsCtrl;

const routerReports = Router();

routerReports.post("/", validateReport, newReport);
routerReports.get("/testemail", testEmail);
routerReports.get("/testemailmicrosoft", testEmailMicrosoft);
routerReports.post("/validateinst", validateInstr, responseInstr);
routerReports.post("/validatefiche", validateFiche, responseFiche);
routerReports.post("/sendreport", validateReport, sendReport);
routerReports.post("/reporttemp", validateReportTemp, newReport);
routerReports.post("/instructor", validateReportInstr, newReportInstructor);
routerReports.post("/environment", validateReporEnvironment, newReportEnvironment);
routerReports.post("/hoursinstructors", validateReportHours, reportHoursInstructors);

export { routerReports };
