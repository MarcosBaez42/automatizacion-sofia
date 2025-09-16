import { Router } from "express";
import { townsCtrl } from "../controller/towns.controller.js";
import { townsVali } from "../validations/towns.validation.js";


const routerTowns = Router();

const { getTowns, 
    registerTown,
    getDepartaments,
    getTownsByDepartament
 } = townsCtrl;

const { validateHeaders } = townsVali;

routerTowns.get("/", validateHeaders, getTowns);
routerTowns.get("/towns/:departament", validateHeaders, getTownsByDepartament);
routerTowns.get("/departaments", validateHeaders, getDepartaments);
routerTowns.post("/register", validateHeaders, registerTown);

export { routerTowns };
