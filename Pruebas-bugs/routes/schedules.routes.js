import { Router } from "express";
import { scheduleCtrl } from "../controller/schedule.controller.js";
import { scheduleVali } from "../validations/schedule.validation.js";

/**
 * Controller functions containing validation functions for schedule registration, existence, update, and headers.
 * @typedef {Object} ScheduleValidation
 * @property {Function} validateRegisterSchedule - Validates schedule registration credentials.
 * @property {Function} validateExistSchedule - Validates schedule existence.
 * @property {Function} validateUpdateSchedule - Validates schedule update credentials.
 * @property {Function} validateScheduleEdit - Validates schedule edit credentials.
 * @property {Function} validateFiche - Validates schedule fiche credentials.
 * @property {Function} validateSchedule - Validates schedule credentials.
 * @property {Function} validateHeaders - Validates schedule headers.
 */
const {
  validateRegisterSchedule,
  validateExistSchedule,
  validateUpdateSchedule,
  validateScheduleEdit,
  validateFiche,
  validateSchedule,
  validateHeaders,
  validateActiveSchedule,
} = scheduleVali;

/**
 * Validation functions functions for getting schedule ID, registering, getting schedules, getting schedule data, getting schedule fiche, getting schedule data for editing, getting schedules with limit, updating, activating, deactivating, and deleting event.
 * @typedef {Object} ScheduleController
 * @property {Function} getScheduleId - Gets schedule ID.
 * @property {Function} registerSchedule - Registers schedule.
 * @property {Function} getSchedules - Gets schedules.
 * @property {Function} getDataValidateSchedule - Gets schedule data.
 * @property {Function} getScheduleFiche - Gets schedule fiche.
 * @property {Function} getDataValidateEditSchedule - Gets schedule data for editing.
 * @property {Function} getSchedulesLimit - Gets schedules with limit.
 * @property {Function} updateSchedule - Updates schedule.
 * @property {Function} activeSchedule - Activates schedule.
 * @property {Function} inactiveSchedule - Deactivates schedule.
 * @property {Function} deleteEventSchedule - Deletes event.
 *
 */ 

const {
  getScheduleId,
  registerSchedule,
  getSchedules,
  getDataValidateSchedule,
  getScheduleFiche,
  getDataValidateEditSchedule,
  getSchedulesLimit,
  updateSchedule,
  activeSchedule,
  inactiveSchedule,
  deleteEventSchedule,
} = scheduleCtrl;

const routerSchedule = Router();

routerSchedule.get("/getthundredschedules", validateHeaders, getSchedulesLimit);
routerSchedule.get("/fiche/:id", validateFiche, getScheduleFiche);
routerSchedule.get("/:id", validateExistSchedule, getScheduleId);
routerSchedule.get("/", validateHeaders, getSchedules);
routerSchedule.post(
  "/validateschedule",
  validateSchedule,
  getDataValidateSchedule
);
routerSchedule.post(
  "/validateeditschedule/:id",
  validateScheduleEdit,
  getDataValidateEditSchedule
);
routerSchedule.post("/register", validateRegisterSchedule, registerSchedule);
routerSchedule.put("/active/:id", validateActiveSchedule, activeSchedule);
routerSchedule.put("/inactive/:id", validateExistSchedule, inactiveSchedule);
routerSchedule.put("/update/:id", validateUpdateSchedule, updateSchedule);
routerSchedule.put(
  "/deleteevent/:id",
  validateExistSchedule,
  deleteEventSchedule
);
export { routerSchedule };
