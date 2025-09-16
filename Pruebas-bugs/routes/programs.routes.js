import { Router } from "express";
import { programCtrl } from "../controller/program.controller.js";
import { programVali } from "../validations/program.validation.js";

/**
 * Controller functions containing validation functions for program registration, existence, update, and headers.
 * @typedef {Object} ProgramValidation
 * @property {Function} validateRegisterProgram - Validates program registration credentials.
 * @property {Function} validateExistProgram - Validates program existence.
 * @property {Function} validateUpdateProgram - Validates program update credentials.
 * @property {Function} validateHeaders - Validates program headers.
 */

const {
  validateRegisterProgram,
  validateExistProgram,
  validateUpdateProgram,
  validateHeaders,
  validateActiveProgram,
} = programVali;

/**
 * Validation functions functions for getting program ID, registering, getting programs, updating, activating, and deactivating.
 * @typedef {Object} ProgramController
 * @property {Function} getProgramId - Gets program ID.
 * @property {Function} registerProgram - Registers program.
 * @property {Function} getPrograms - Gets programs.
 * @property {Function} updateProgram - Updates program.
 * @property {Function} activeProgram - Activates program.
 * @property {Function} inactiveProgram - Deactivates program.
 */

const {
  getProgramId,
  registerProgram,
  getPrograms,
  updateProgram,
  activeProgram,
  inactiveProgram,
} = programCtrl;

const routerProgram = Router();

routerProgram.get("/:id", validateExistProgram, getProgramId);
routerProgram.get("/", validateHeaders, getPrograms);
routerProgram.post("/register", validateRegisterProgram, registerProgram);
routerProgram.put("/active/:id", validateActiveProgram, activeProgram);
routerProgram.put("/inactive/:id", validateExistProgram, inactiveProgram);
routerProgram.put("/update/:id", validateUpdateProgram, updateProgram);

export { routerProgram };
