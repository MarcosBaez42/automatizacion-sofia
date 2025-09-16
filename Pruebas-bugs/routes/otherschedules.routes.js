import { Router } from "express";
import { otherScheduleCtrl } from "../controller/otherschedule.controller.js";
import { otherScheduleVali } from "../validations/otherschedule.validation.js";

/**
 * Controller functions containing validation functions for other schedule registration, existence, update, and headers.
 * @typedef {Object} OtherScheduleValidation
 * @property {Function} validateRegisterOtherSchedule - Validates other schedule registration credentials.
 * @property {Function} validateExistOtherSchedule - Validates other schedule existence.
 * @property {Function} validateUpdateOtherSchedule - Validates other schedule update credentials.
 * @property {Function} validateOtherScheduleEdit - Validates other schedule edit credentials.
 * @property {Function} validateOtherSchedule - Validates other schedule credentials.
 * @property {Function} validateHeaders - Validates other schedule headers.
 */

const {
  validateRegisterOtherSchedule,
  validateExistOtherSchedule,
  validateUpdateOtherSchedule,
  validateOtherScheduleEdit,
  validateOtherSchedule,
  validateInstructor,
  validateHeaders,
  validateActiveOtherSchedule,
} = otherScheduleVali;

/**
 * Validation functions functions for getting other schedule ID, registering, getting other schedules, getting other schedules by instructor, getting other schedule data, getting other schedule data for editing, getting other schedules with limit, updating, activating, deactivating, and deleting event.
 * @typedef {Object} OtherScheduleController
 * @property {Function} getOtherScheduleId - Gets other schedule ID.
 * @property {Function} registerOtherSchedule - Registers other schedule.
 * @property {Function} getOthersSchedules - Gets other schedules.
 * @property {Function} getOthersSchedulesInstructor - Gets other schedules by instructor.
 * @property {Function} getDataValidateOtherSchedule - Gets other schedule data.
 * @property {Function} getDataValidateEditOtherSchedule - Gets other schedule data for editing.
 * @property {Function} getOtherSchedulesLimit - Gets other schedules with limit.
 * @property {Function} updateOtherSchedule - Updates other schedule.
 * @property {Function} activeOtherSchedule - Activates other schedule.
 * @property {Function} inactiveOtherSchedule - Deactivates other schedule.
 * @property {Function} deleteEventOtherSchedule - Deletes event.
 */

const {
  getOtherScheduleId,
  registerOtherSchedule,
  getOthersSchedules,
  getOthersSchedulesInstructor,
  getDataValidateOtherSchedule,
  getDataValidateEditOtherSchedule,
  getOtherSchedulesLimit,
  updateOtherSchedule,
  activeOtherSchedule,
  inactiveOtherSchedule,
  deleteEventOtherSchedule,
} = otherScheduleCtrl;

const routerOtherSchedule = Router();

routerOtherSchedule.get(
  "/getthundredschedules",
  validateHeaders,
  getOtherSchedulesLimit 
);
routerOtherSchedule.get(
  "/instructor/:id",
  validateInstructor,
  getOthersSchedulesInstructor
);
routerOtherSchedule.get("/:id", validateExistOtherSchedule, getOtherScheduleId);
routerOtherSchedule.get("/", validateHeaders, getOthersSchedules);
routerOtherSchedule.post(
  "/validateschedule",
  validateOtherSchedule,
  getDataValidateOtherSchedule
);
routerOtherSchedule.post(
  "/validateeditschedule/:id",
  validateOtherScheduleEdit,
  getDataValidateEditOtherSchedule
);
routerOtherSchedule.post(
  "/register",
  validateRegisterOtherSchedule,
  registerOtherSchedule
);
routerOtherSchedule.put(
  "/active/:id",
  validateActiveOtherSchedule,
  activeOtherSchedule
);
routerOtherSchedule.put(
  "/inactive/:id",
  validateExistOtherSchedule,
  inactiveOtherSchedule
);
routerOtherSchedule.put(
  "/update/:id",
  validateUpdateOtherSchedule,
  updateOtherSchedule
);
routerOtherSchedule.put(
  "/deleteevent/:id",
  validateExistOtherSchedule,
  deleteEventOtherSchedule
);
export { routerOtherSchedule };
