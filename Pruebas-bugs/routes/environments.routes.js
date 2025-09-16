import { Router } from "express";
import { environmentCtrl } from "../controller/environment.controller.js";
import { environmentVali } from "../validations/environment.validation.js";

/**
 * Controller functions containing validation functions for environment registration, existence, update, and headers.
 * @typedef {Object} EnvironmentValidation
 * @property {Function} validateRegisterEnvironment - Validates environment registration credentials.
 * @property {Function} validateExistEnvironment - Validates environment existence.
 * @property {Function} validateUpdateEnvironment - Validates environment update credentials.
 * @property {Function} validateHeaders - Validates environment headers.
 */

const {
  validateRegisterEnvironment,
  validateExistEnvironment,
  validateUpdateEnvironment,
  validateHeaders,
} = environmentVali;

/**
 * Validation functions functions for getting environment ID, registering, getting environments, updating, activating, and deactivating.
 * @typedef {Object} EnvironmentController
 * @property {Function} getEnvironmentId - Gets environment ID.
 * @property {Function} registerEnvironment - Registers environment.
 * @property {Function} getEnvironments - Gets environments.
 * @property {Function} updateEnvironment - Updates environment.
 * @property {Function} activeEnvironment - Activates environment.
 * @property {Function} inactiveEnvironment - Deactivates environment.
 */

const {
  getEnvironmentId,
  registerEnvironment,
  getEnvironments,
  updateEnvironment,
  activeEnvironment,
  inactiveEnvironment,
} = environmentCtrl;

const routerEnvironment = Router();

routerEnvironment.get("/:id", validateExistEnvironment, getEnvironmentId);
routerEnvironment.get("/", validateHeaders, getEnvironments);
routerEnvironment.post(
  "/register",
  validateRegisterEnvironment,
  registerEnvironment
);
routerEnvironment.put(
  "/active/:id",
  validateExistEnvironment,
  activeEnvironment
);
routerEnvironment.put(
  "/inactive/:id",
  validateExistEnvironment,
  inactiveEnvironment
);
routerEnvironment.put(
  "/update/:id",
  validateUpdateEnvironment,
  updateEnvironment
);

export { routerEnvironment };
