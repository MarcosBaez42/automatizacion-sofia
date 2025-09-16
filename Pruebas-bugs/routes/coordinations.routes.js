import { Router } from "express";
import { coordinationCtrl } from "../controller/coordination.controller.js";
import { coordinationVali } from "../validations/coordination.validation.js";

/**
 * Controller functions containing validation functions for coordination registration, existence, update, and headers.
 * @typedef {Object} CoordinationValidation
 * @property {Function} validateRegisterCoordination - Validates coordination registration credentials.
 * @property {Function} validateExistCoordination - Validates coordination existence.
 * @property {Function} validateUpdateCoordination - Validates coordination update credentials.
 * @property {Function} validateHeadersSuper - Validates coordination headers.
 */
const {
  validateRegisterCoordination,
  validateExistCoordination,
  validateUpdateCoordination,
  validateHeadersSuper,
  validateActiveCoordination,
} = coordinationVali;

/**
 * Validation functions functions for getting coordination ID, registering, getting coordinations, updating, activating, and deactivating.
 * @typedef {Object} CoordinationController
 * @property {Function} getCoordinationId - Gets coordination ID.
 * @property {Function} registerCoordination - Registers coordination.
 * @property {Function} getCoordinations - Gets coordinations.
 * @property {Function} updateCoordination - Updates coordination.
 * @property {Function} activeCoordination - Activates coordination.
 * @property {Function} inactiveCoordination - Deactivates coordination.
 */

const {
  getCoordinationId,
  registerCoordination,
  getCoordinations,
  updateCoordination,
  activeCoordination,
  inactiveCoordination,
} = coordinationCtrl;

const routerCoordination = Router();

routerCoordination.get("/:id", validateExistCoordination, getCoordinationId);
routerCoordination.get("/", validateHeadersSuper, getCoordinations);
routerCoordination.post(
  "/register",
  validateRegisterCoordination,
  registerCoordination
);
routerCoordination.put(
  "/active/:id",
  validateActiveCoordination,
  activeCoordination
);
routerCoordination.put(
  "/inactive/:id",
  validateExistCoordination,
  inactiveCoordination
);
routerCoordination.put(
  "/update/:id",
  validateUpdateCoordination,
  updateCoordination
);

export { routerCoordination };
