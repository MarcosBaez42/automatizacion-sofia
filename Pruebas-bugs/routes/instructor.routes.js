import { Router } from "express";
import { instrCtrl } from "../controller/instructor.controller.js";
import { instructorVali } from "../validations/instructor.validation.js";

/**
 * Controller functions containing validation functions for instructor registration, existence, update, and headers.
 * @typedef {Object} InstructorValidation
 * @property {Function} validateRegisterInstr - Validates instructor registration credentials.
 * @property {Function} validateExistInstr - Validates instructor existence.
 * @property {Function} validateUpdateInstr - Validates instructor update credentials.
 * @property {Function} validateHeaders - Validates instructor headers.
 */

const {
  validateEmail,
  validateRegisterInstr,
  validateExistInstr,
  validateUpdateInstr,
  validateHeaders,
  validateActiveInstr,
  validatetokenloginInstru,
} = instructorVali;

/**
 * Validation functions functions for getting instructor ID, registering, getting instructors, updating, activating, and deactivating.
 * @typedef {Object} InstructorController
 * @property {Function} getInstrId - Gets instructor ID.
 * @property {Function} registerInstr - Registers instructor.
 * @property {Function} getInstrs - Gets instructors.
 * @property {Function} updateInstr - Updates instructor.
 * @property {Function} activeInstr - Activates instructor.
 * @property {Function} inactiveInstr - Deactivates instructor.
 */
const {
  getInstrId,
  registerInstr,
  getInstrs,
  loginUser,
  updateInstr,
  activeInstr,
  inactiveInstr,
  changePasswordInst,
  resetPassword,
  validateTokenLogin
} = instrCtrl;

const routerInstructor = Router();

routerInstructor.get("/:id", validateExistInstr, getInstrId);
routerInstructor.get("/", validateHeaders, getInstrs);
routerInstructor.post("/login", [], loginUser);
routerInstructor.post("/token/productive/stages", validatetokenloginInstru,validateTokenLogin);
routerInstructor.post("/resetpassword", validateEmail, resetPassword);
routerInstructor.post("/changepassword", validateEmail, changePasswordInst);
routerInstructor.post("/register", validateRegisterInstr, registerInstr);
routerInstructor.put("/active/:id", validateActiveInstr, activeInstr);
routerInstructor.put("/inactive/:id", validateExistInstr, inactiveInstr);
routerInstructor.put("/update/:id", validateUpdateInstr, updateInstr);

export { routerInstructor };
