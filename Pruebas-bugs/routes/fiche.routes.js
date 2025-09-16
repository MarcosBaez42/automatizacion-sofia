import { Router } from "express";
import { ficheCtrl } from "../controller/fiche.controller.js";
import { ficheVali } from "../validations/fiche.validation.js";

/**
 * Controller functions containing validation functions for fiche registration, existence, update, and headers.
 * @typedef {Object} FicheValidation
 * @property {Function} validateRegisterFiche - Validates fiche registration credentials.
 * @property {Function} validateExistFiche - Validates fiche existence.
 * @property {Function} validateUpdateFiche - Validates fiche update credentials.
 * @property {Function} validateHeaders - Validates fiche headers.
 */

const {
  validateRegisterFiche,
  validateExistFiche,
  validateUpdateFiche,
  validateHeaders,
  validateActiveFiche
} = ficheVali;

/**
 * Validation functions functions for getting fiche ID, registering, getting fiches, updating, activating, and deactivating.
 * @typedef {Object} FicheController
 * @property {Function} getFicheId - Gets fiche ID.
 * @property {Function} registerFiche - Registers fiche.
 * @property {Function} getFiches - Gets fiches.
 * @property {Function} updateFiche - Updates fiche.
 * @property {Function} activeFiche - Activates fiche.
 * @property {Function} inactiveFiche - Deactivates fiche.
 */

const {
  getFicheId,
  registerFiche,
  getFichesPublic,
  getFiches,
  getFichesCoordination,
  updateFiche,
  activeFiche,
  inactiveFiche,
} = ficheCtrl;

const routerFiche = Router();

routerFiche.get("/public", getFichesPublic);
routerFiche.get("/coordination", validateHeaders, getFichesCoordination);
routerFiche.get("/:id", validateExistFiche, getFicheId);
routerFiche.get("/", validateHeaders, getFiches);
routerFiche.post("/register", validateRegisterFiche, registerFiche);
routerFiche.put("/active/:id", validateActiveFiche, activeFiche);
routerFiche.put("/inactive/:id", validateExistFiche, inactiveFiche);
routerFiche.put("/update/:id", validateUpdateFiche, updateFiche);

export { routerFiche };
