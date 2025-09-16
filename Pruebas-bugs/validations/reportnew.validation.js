import { check, cookie } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { ficheHelper } from "../helpers/fiche.helper.js";
import { coordinationHelper } from "../helpers/coordination.helper.js";
import { differenceBetweenDates } from "../utils/functions/dates.js";

const { validateExistFicheById } = ficheHelper;
const { validateToken } = webToken;
const { validateExistCoordinationById } = coordinationHelper;

const reportNewVali = {};

const typesNews = [
  "TODOS",
  "TRASLADO",
  "RETIRO VOLUNTARIO",
  "REINGRESO",
  "REINGRESO ESPECIAL",
  "APLAZAMIENTO",
  "DESERCIÓN",
  "PLAN DE MEJORAMIENTO",
];

const statesNews = [
  "TODOS",
  "REGISTRADA",
  "EN PROCESO",
  "RECHAZADA",
  "FINALIZADA",
];

reportNewVali.validateBasic = [
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fend", "La fecha de finalización es obligatoria").notEmpty(),
  check("fstart").custom(async (fstart, { req }) => {
    if (!Date.parse(fstart)) {
      throw new Error("La fecha de inicio no es valida");
    } else if (!Date.parse(req.body.fend)) {
      throw new Error("La fecha de finalización no es valida");
    } else if (new Date(fstart) > new Date(req.body.fend)) {
      throw new Error(
        "La fecha de inicio no puede ser mayor a la fecha de finalización"
      );
    }
  }),
  check("fstart").custom(async (fstart, { req }) => {
    const months = differenceBetweenDates(fstart, req.body.fend);
    if (months > 12) {
      throw new Error("El rango de fechas no puede ser mayor a 12 meses");
    }
  }),

  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

reportNewVali.validateActa = [
  check("acta", "El numero de acta es obligatorio").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

reportNewVali.validateTypeNew = [
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn(typesNews),
  check("coordination", "La coordinación es obligatoria").notEmpty(),
  check("coordination").custom(async (coordination) => {
    if (coordination == "TODAS") {
      return true;
    } else {
      await validateExistCoordinationById(coordination);
    }
  }),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fend", "La fecha de finalización es obligatoria").notEmpty(),
  check("fstart").custom(async (fstart, { req }) => {
    if (!Date.parse(fstart)) {
      throw new Error("La fecha de inicio no es valida");
    } else if (!Date.parse(req.body.fend)) {
      throw new Error("La fecha de finalización no es valida");
    } else if (new Date(fstart) > new Date(req.body.fend)) {
      throw new Error(
        "La fecha de inicio no puede ser mayor a la fecha de finalización"
      );
    }
  }),
  check("fstart").custom(async (fstart, { req }) => {
    const months = differenceBetweenDates(fstart, req.body.fend);
    if (months > 12) {
      throw new Error("El rango de fechas no puede ser mayor a 12 meses");
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

reportNewVali.validateImprovement = [
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn(["PLAN DE MEJORAMIENTO"]),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fend", "La fecha de finalización es obligatoria").notEmpty(),
  check("fstart").custom(async (fstart, { req }) => {
    if (!Date.parse(fstart)) {
      throw new Error("La fecha de inicio no es valida");
    } else if (!Date.parse(req.body.fend)) {
      throw new Error("La fecha de finalización no es valida");
    } else if (new Date(fstart) > new Date(req.body.fend)) {
      throw new Error(
        "La fecha de inicio no puede ser mayor a la fecha de finalización"
      );
    }
  }),
  check("fstart").custom(async (fstart, { req }) => {
    const months = differenceBetweenDates(fstart, req.body.fend);
    if (months > 12) {
      throw new Error("El rango de fechas no puede ser mayor a 12 meses");
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

reportNewVali.validateStatus = [
  check("state", "El estado es obligatorio").notEmpty(),
  check("state", "El estado no es valido").isIn(statesNews),
  check("fstart", "La fecha de inicio es obligatoria").notEmpty(),
  check("fend", "La fecha de finalización es obligatoria").notEmpty(),
  check("fstart").custom(async (fstart, { req }) => {
    if (!Date.parse(fstart)) {
      throw new Error("La fecha de inicio no es valida");
    } else if (!Date.parse(req.body.fend)) {
      throw new Error("La fecha de finalización no es valida");
    } else if (new Date(fstart) > new Date(req.body.fend)) {
      throw new Error(
        "La fecha de inicio no puede ser mayor a la fecha de finalización"
      );
    }
  }),
  check("fstart").custom(async (fstart, { req }) => {
    const months = differenceBetweenDates(fstart, req.body.fend);
    if (months > 12) {
      throw new Error("El rango de fechas no puede ser mayor a 12 meses");
    }
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

reportNewVali.validateFiche = [
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

reportNewVali.validateStudent = [
  check("student", "El documento del aprendiz es obligatorio").notEmpty(),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { reportNewVali };
