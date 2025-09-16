import { Router } from "express";
import { outcomeCtrl } from "../controller/outcome.controller.js";
import { outcomeVali } from "../validations/outcome.validation.js";

/**
 * Controller functions containing validation functions for outcome registration, existence, update, and headers.
 * @typedef {Object} OutcomeValidation
 * @property {Function} validateRegisterOutcome - Validates outcome registration credentials.
 * @property {Function} validateExistOutcome - Validates outcome existence.
 * @property {Function} validateUpdateOutcome - Validates outcome update credentials.
 * @property {Function} validateHeaders - Validates outcome headers.
 */

const {
  validateRegisterOutcome,
  validateExistOutcome,
  validateUpdateOutcome,
  validateCompOut,
  validateHeaders,
  validateActiveOutcome,
} = outcomeVali;

/**
 * Validation functions functions for getting outcome ID, registering, getting outcomes, getting outcomes by competence, updating, activating, and deactivating.
 * @typedef {Object} OutcomeController
 * @property {Function} getOutcomeId - Gets outcome ID.
 * @property {Function} registerOutcome - Registers outcome.
 * @property {Function} getOutcomes - Gets outcomes.
 * @property {Function} getOutcomesByComp - Gets outcomes by competence.
 * @property {Function} updateOutcome - Updates outcome.
 * @property {Function} activeOutcome - Activates outcome.
 * @property {Function} inactiveOutcome - Deactivates outcome.
 * @property {Function} getOutcomesLimit - Gets outcomes with limit.
 */

const {
  getOutcomeId,
  registerOutcome,
  getOutcomes,
  getOutcomesByComp,
  updateOutcome,
  activeOutcome,
  inactiveOutcome,
  getOutcomesLimit,
} = outcomeCtrl;

const routerOutcome = Router();

routerOutcome.get("/getthundredoutcomes", validateHeaders, getOutcomesLimit);
routerOutcome.get("/competence/:id", validateCompOut, getOutcomesByComp);
routerOutcome.get("/:id", validateExistOutcome, getOutcomeId);
routerOutcome.get("/", validateHeaders, getOutcomes);
routerOutcome.post("/register", validateRegisterOutcome, registerOutcome);
routerOutcome.put("/active/:id", validateActiveOutcome, activeOutcome);
routerOutcome.put("/inactive/:id", validateExistOutcome, inactiveOutcome);
routerOutcome.put("/update", validateUpdateOutcome, updateOutcome);

export { routerOutcome };
