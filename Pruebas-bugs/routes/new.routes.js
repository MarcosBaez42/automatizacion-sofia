import { Router } from "express";
import { newCtrl } from "../controller/new.controller.js";
import { newVali } from "../validations/new.validation.js";

const {
  validateRegisterNew,
  validateFormPublic,
  validateUpdateNew,
  validateExistInst,
  validateFiche,
  validateUpdateByInst,
  validateImprovement,
  validateUpdateImprovement,
  validateUpdateAdvancedNew,
  validateUpdateMultiples,
  validateUpgradePostpone,
  validateExistNew,
  validateExistImprovement,
  validateHeaders,
} = newVali;

const {
  registerNew,
  registerNewPublic,
  registerImprovement,
  updateNew,
  getNewsNotProcessed,
  getNewsNotProcessedActaNull,
  getImprovement,
  getNewsByInstructor,
  updateAdvancedNew,
  updateMultiplesNew,
  upgradePostponeNews,
  updateImprovement,
  getNewId,
  getNews,
  getItemsByFiche,
  inactiveNew,
  activeNew,
  aproveNew,
  notAproveNew,
  sendEmailNew
  
} = newCtrl;

const routerNew = Router();


routerNew.get("/onlyprocessedactanull", validateHeaders, getNewsNotProcessedActaNull);
routerNew.get("/onlyprocessed", validateHeaders, getNewsNotProcessed);
routerNew.get("/onlyimprovement", validateHeaders, getImprovement);
routerNew.get("/newbyinstructor/:id", validateExistInst, getNewsByInstructor);
routerNew.get("/:id", validateExistNew, getNewId);
routerNew.get("/", validateHeaders, getNews);
routerNew.get("/fiche/:fiche/items", validateFiche, getItemsByFiche);

routerNew.post("/register", validateRegisterNew, registerNew);
routerNew.post("/registerimprovement", validateImprovement, registerImprovement);
routerNew.post("/registerpublic", validateFormPublic, registerNewPublic);
routerNew.put("/active/:id", validateExistNew, activeNew);
routerNew.put("/inactive/:id", validateExistNew, inactiveNew);
routerNew.put("/update/:id", validateUpdateNew, updateNew);
routerNew.put("/updatemultiple", validateUpdateMultiples, updateMultiplesNew);
routerNew.put("/upgradepostpone", validateUpgradePostpone, upgradePostponeNews);
routerNew.put("/updateadvanced/:id",validateUpdateAdvancedNew,updateAdvancedNew);
routerNew.put("/updateimprovement/:id",validateUpdateImprovement,updateImprovement);
routerNew.put("/aprovenew",validateUpdateByInst,aproveNew)
routerNew.put("/notaprovenew",validateUpdateByInst,notAproveNew)
routerNew.put("/sendemail/:id", validateExistImprovement, sendEmailNew);



export { routerNew };
