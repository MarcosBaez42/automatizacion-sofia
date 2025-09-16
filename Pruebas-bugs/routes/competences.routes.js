import { Router } from "express";
import { competenceCtrl } from "../controller/competence.controller.js";
import { competenceVali } from "../validations/competence.validation.js";

/**
 * Controller functions containing validation functions for competence registration, existence, update, and headers.
 * @typedef {Object} CompetenceValidation
 * @property {Function} validateRegisterCompetence - Validates competence registration credentials.
 * @property {Function} validateExistCompetence - Validates competence existence.
 * @property {Function} validateUpdateCompetence - Validates competence update credentials.
 * @property {Function} validateHeaders - Validates competence headers.
 */

const {
  validateRegisterCompetence,
  validateExistProgram,
  validateExistCompetence,
  validateUpdateCompetence,
  validateHeaders,
  validateActiveCompetence
} = competenceVali;

/**
 * Validation functions functions for getting competence ID, registering, getting competences, updating, activating, and deactivating.
 * @typedef {Object} CompetenceController
 * @property {Function} getCompetenceId - Gets competence ID.
 * @property {Function} registerCompetence - Registers competence.
 * @property {Function} getCompetences - Gets competences.
 * @property {Function} updateCompetence - Updates competence.
 * @property {Function} activeCompetence - Activates competence.
 * @property {Function} inactiveCompetence - Deactivates competence.
 */

const {
  getCompetenceId,
  getProgramCompetence,
  registerCompetence,
  getCompetences,
  updateCompetence,
  activeCompetence,
  inactiveCompetence,

  deleteFichas
} = competenceCtrl;

const routerCompetence = Router();

routerCompetence.get(
  "/program/:id",
  validateExistProgram,
  getProgramCompetence
);
routerCompetence.get("/:id", validateExistCompetence, getCompetenceId);
routerCompetence.get("/", validateHeaders, getCompetences);
routerCompetence.post(
  "/register",
  validateRegisterCompetence,
  registerCompetence
);
routerCompetence.put("/active/:id", validateActiveCompetence, activeCompetence);
routerCompetence.put(
  "/inactive/:id",
  validateExistCompetence,
  inactiveCompetence
);
routerCompetence.put("/update/:id", validateUpdateCompetence, updateCompetence);

export { routerCompetence };
