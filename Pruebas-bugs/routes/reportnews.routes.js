import { Router } from "express";
import { reportNewCtrl } from "../controller/reportnews.controller.js";
import { reportNewVali } from "../validations/reportnew.validation.js";

const {
  validateBasic,
  validateActa,
  validateTypeNew,
  validateImprovement,
  validateStatus,
  validateFiche,
  validateStudent
} = reportNewVali;

const {
  getReportBasic,
  getReportActa,
  getReportTypeNew,
  getReportImprovement,
  getReportStatus,
  getReportFiche,
  getReportStudent
} = reportNewCtrl;

const routerReportNew = Router();

routerReportNew.post("/statistics", validateBasic, getReportBasic);
routerReportNew.post("/acta", validateActa, getReportActa);
routerReportNew.post("/typenew", validateTypeNew, getReportTypeNew);
routerReportNew.post("/typenew/improvement", validateImprovement, getReportImprovement);
routerReportNew.post("/status", validateStatus, getReportStatus);
routerReportNew.post("/fiche", validateFiche, getReportFiche);
routerReportNew.post("/student", validateStudent, getReportStudent);

export { routerReportNew };
