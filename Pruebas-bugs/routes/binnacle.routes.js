import { Router } from "express";
import { binnacleCtrl } from "../controller/binnacle.controller.js";
import { binnacleVali } from "../validations/binnacle.validation.js";


const { listBinnacle,filterBinnacle } = binnacleCtrl;
const { validateFilter,validateToken } = binnacleVali;

const routerBinnacle = Router();

routerBinnacle.get("/", validateToken, listBinnacle);
routerBinnacle.post("/filterbinnacle", validateFilter, filterBinnacle);

export { routerBinnacle };
