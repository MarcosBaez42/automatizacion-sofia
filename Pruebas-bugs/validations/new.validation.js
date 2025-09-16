/**
 * This module contains the validation functions for the fiche routes
 * @module validations/fiche.validation
 * @requires express-validator/check
 * @requires middlewares/webToken
 * @requires middlewares/validateFields
 * @requires helpers/fiche.helper
 * @requires helpers/program.helper
 * @requires helpers/instructor.helper
 * @requires helpers/coordination.helper
 * @exports newVali
 */

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";
import { ficheHelper } from "../helpers/fiche.helper.js";
import { newHelper } from "../helpers/new.helper.js";
import { instrHelper } from "../helpers/instructor.helper.js";
import { competenceHelper } from "../helpers/competence.helper.js";
import { outcomeHelper } from "../helpers/outcome.helper.js";

const { validateExistNew, validateExistImprovement, validateDuplicateNew } =
  newHelper;
const { validateExistFicheById } = ficheHelper;
const { validateExistInstrById } = instrHelper;
const { validateExistCompetenceById } = competenceHelper;
const { validateExistOutcomeById } = outcomeHelper;
const { validateToken } = webToken;

const newVali = {};
let typesNews = [
  "TRASLADO",
  "RETIRO VOLUNTARIO",
  "REINGRESO",
  "REINGRESO ESPECIAL",
  "APLAZAMIENTO",
  "DESERCIÓN",
  "PLAN DE MEJORAMIENTO",
];

let workingsDays = ["MAÑANA", "TARDE", "NOCHE"];
let typeTransfers = ["CENTRO", "JORNADA", "POR CERTIFICACIÓN"];
let documents = ["CC", "TI", "CE", "PASAPORTE"];
let statusOptions = ["REGISTRADA", "EN PROCESO", "APROBADA", "NO APROBADA"];
let subtypes = [
  "MOTIVOS LABORALES",
  "MOTIVOS PERSONALES",
  "CALAMIDAD DOMESTICA",
  "CAMBIO DE DOMICILIO",
  "ENFERMEDAD",
  "LICENCIA DE MATERNIDAD",
  "PROBLEMAS ECÓNOMICOS",
  "PROBLEMAS FAMILIARES",
  "PROBLEMAS LABORALES",
  "SERVICIO MILITAR",
];

newVali.validateRegisterNew = [
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn(typesNews),
  check("tpnew").custom(async (tpnew, { req }) => {
    req.booleanRol=true
    if (req.instructor !== "undefined") {
      req.booleanRol=false
    }

    if (
      tpnew == "TRASLADO" &&
      !typeTransfers.includes(req.body.typetransfer) &&
      !subtypes.includes(req.body.subtype)
    ) {
      throw new Error("El tipo de traslado no es valido");
    } else if (
      req.body.typetransfer == "JORANDA" &&
      !workingsDays.includes(req.body.workingday)
    ) {
      throw new Error("La jornada no es valida");
    } else if (req.body.typetransfer == "CENTRO") {
      if (!req.body.center) {
        throw new Error("El centro es obligatorio");
      } else if (!req.body.city) {
        throw new Error("La ciudad es obligatoria");
      }
    } else if (tpnew == "APLAZAMIENTO") {
      if (isNaN(req.body.duration)) {
        throw new Error("La duración no es valida");
      } else if (!subtypes.includes(req.body.subtype)) {
        throw new Error("El subtipo no es valido");
      }
    }

    await validateDuplicateNew(
      req.body.document,
      req.body.tpnew,
      req.body.fiche
    );
  }),

  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(documents),
  check("document", "El documento es obligatorio").notEmpty(),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check("phone", "El telefono no es valido").isLength({ min: 10, max: 10 }),
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("fiche").custom(async (fiche, { req }) => {
    const fileUpload = req.files;
    //validar que sea imagen png o jpg
    if (
      fileUpload?.file &&
      fileUpload.file.mimetype != "image/png" &&
      fileUpload.file.mimetype != "image/jpg" &&
      fileUpload.file.mimetype != "application/pdf" &&
      fileUpload.file.mimetype != "image/jpeg"
    ) {
      throw new Error("El archivo no es valido");
    }
  }),
  check("datesofia").custom(async (datesofia, { req }) => {
    if (req.body.tpnew !== "DESERCIÓN") {
      //validar si una fecha valida
      if (!Date.parse(datesofia)) {
        throw new Error("La fecha de registro no es valida");
      }

      //la fecha de sofia no puede ser mayor a la fecha actual
      if (new Date(datesofia) > new Date()) {
        throw new Error(
          "La fecha de registro no puede ser mayor a la fecha actual"
        );
      }
    }
  }),
  check("token").custom(async (token,{req}) => {
    await validateToken(token,req.booleanRol);
  }),
  validateFields,
];

newVali.validateFormPublic = [
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn(typesNews),
  check("tpnew").custom(async (tpnew, { req }) => {
    if (
      tpnew == "TRASLADO" &&
      !typeTransfers.includes(req.body.typetransfer) &&
      !subtypes.includes(req.body.subtype)
    ) {
      throw new Error("El tipo de traslado no es valido");
    } else if (
      req.body.typetransfer == "JORANDA" &&
      !workingsDays.includes(req.body.workingday)
    ) {
      throw new Error("La jornada no es valida");
    } else if (req.body.typetransfer == "CENTRO") {
      if (!req.body.center) {
        throw new Error("El centro es obligatorio");
      } else if (!req.body.city) {
        throw new Error("La ciudad es obligatoria");
      }
    } else if (tpnew == "APLAZAMIENTO") {
      if (isNaN(req.body.duration)) {
        throw new Error("La duración no es valida");
      } else if (!subtypes.includes(req.body.subtype)) {
        throw new Error("El subtipo no es valido");
      }
    }

    await validateDuplicateNew(
      req.body.document,
      req.body.tpnew,
      req.body.fiche
    );
  }),

  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(documents),
  check("document", "El documento es obligatorio").notEmpty(),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check("phone", "El telefono no es valido").isLength({ min: 10, max: 10 }),

  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("fiche").custom(async (fiche, { req }) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new Error("El archivo es obligatorio");
    }
    const { file } = req.files;
    //validar que sea imagen png o jpg
    if (
      file.mimetype != "image/png" &&
      file.mimetype != "image/jpg" &&
      file.mimetype != "image/jpeg"
    ) {
      throw new Error("El archivo no es valido");
    }
  }),
  check("datesofia").custom(async (datesofia) => {
    //validar si una fecha valida
    if (!Date.parse(datesofia)) {
      throw new Error("La fecha de registro no es valida");
    }

    //la fecha de sofia no puede ser mayor a la fecha actual
    if (new Date(datesofia) > new Date()) {
      throw new Error(
        "La fecha de registro no puede ser mayor a la fecha actual"
      );
    }
  }),
  validateFields,
];

newVali.validateUpdateNew = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id,{req}) => {
    await validateExistNew(id,req);
  }),
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn(typesNews),
  check("tpnew").custom(async (tpnew, { req }) => {
    req.booleanRol=true
    if (req.instructor !== "undefined") {
      req.booleanRol=false
    }

    if (
      tpnew == "TRASLADO" &&
      !typeTransfers.includes(req.body.typetransfer) &&
      !subtypes.includes(req.body.subtype)
    ) {
      throw new Error("El tipo de traslado no es valido");
    } else if (
      req.body.typetransfer == "JORANDA" &&
      !workingsDays.includes(req.body.workingday)
    ) {
      throw new Error("La jornada no es valida");
    } else if (req.body.typetransfer == "CENTRO") {
      if (!req.body.center) {
        throw new Error("El centro es obligatorio");
      } else if (!req.body.city) {
        throw new Error("La ciudad es obligatoria");
      }
    } else if (tpnew == "APLAZAMIENTO") {
      if (isNaN(req.body.duration)) {
        throw new Error("La duración no es valida");
      } else if (!subtypes.includes(req.body.subtype)) {
        throw new Error("El subtipo no es valido");
      }
    }
  }),

  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(documents),
  check("document", "El documento es obligatorio").notEmpty(),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check("phone", "El telefono no es valido").isLength({ min: 10, max: 10 }),

  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("fiche").custom(async (fiche, { req }) => {
    const fileUpload = req.files;
    //validar que sea imagen png o jpg
    if (
      fileUpload?.file &&
      fileUpload.file.mimetype != "image/png" &&
      fileUpload.file.mimetype != "image/jpg" &&
      fileUpload.file.mimetype != "application/pdf" &&
      fileUpload.file.mimetype != "image/jpeg"
    ) {
      throw new Error("El archivo no es valido");
    }
  }),
  check("datesofia").custom(async (datesofia, { req }) => {
    //validar si una fecha valida
    if (req.body.tpnew !== "DESERCIÓN") {
      if (!Date.parse(datesofia)) {
        throw new Error("La fecha de registro no es valida");
      }

      //la fecha de sofia no puede ser mayor a la fecha actual
      if (new Date(datesofia) > new Date()) {
        throw new Error(
          "La fecha de registro no puede ser mayor a la fecha actual"
        );
      }
    }
  }),

  check("token").custom(async (token,{req}) => {
    await validateToken(token,req.booleanRol);
  }),
  validateFields,
];

newVali.validateUpdateAdvancedNew = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id, {req}) => {
    await validateExistNew(id, req);
  }),
  check("datesofia").custom(async (datesofia) => {
    //validar si una fecha valida
    if (datesofia && !Date.parse(datesofia)) {
      throw new Error("La fecha de sofia no es valida");
    }
  }),

  check("state", "El estado es obligatorio").notEmpty(),
  check("state", "El estado no es valido").isIn(statusOptions),
  check("processed", "El estado de envio es obligatorio").notEmpty(),
  check("processed", "El estado de envio no es valido").isBoolean(),
  check("answers").custom(async (answers) => {
    if (answers.length != 0) {
      answers.forEach((answer) => {
        if (answer.info == "") {
          throw new Error("La respuesta no puede estar vacia");
        }
        if (!answer.date || !Date.parse(answer.date)) {
          answer.date = new Date();
        }
      });
    }
  }),

  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

newVali.validateUpdateMultiples = [
  check("news", "Los ids son obligatorios").notEmpty(),
  check("news", "Los ids no son validos").isArray(),
  check("news").custom(async (news) => {
    news.forEach(async (id) => {
      await validateExistNew(id);
    });
  }),
  check("answers").custom(async (answers) => {
    if (answers.length != 0) {
      answers.forEach((answer) => {
        if (answer.info == "") {
          throw new Error("La respuesta no puede estar vacia");
        }
        if (!answer.date || !Date.parse(answer.date)) {
          answer.date = new Date();
        }
      });
    }
  }),
  check("type", "El tipo de actualizacion es obligatorio").notEmpty(),
  check("type", "El tipo de actualizacion no es valido").isIn([
    "process",
    "acta",
  ]),
  check("type").custom(async (type, { req }) => {
    if (type && type == "acta") {
      if (!req.body.numberact) {
        throw new Error("El numero de acta es obligatorio");
      }
      //validar que processed sea un booleano
      if (req.body.processed && typeof req.body.processed != "boolean") {
        throw new Error("La aprovación no es valida");
      }
      if (
        req.body.state &&
        !["APROBADA", "NO APROBADA"].includes(req.body.state)
      ) {
        throw new Error("El estado solo puede ser APROBADA o NO APROBADA");
      }
    } else if (type && type == "process") {
      if (req.body.state && !statusOptions.includes(req.body.state)) {
        throw new Error(
          "El estado solo puede ser REGISTRADA, EN PROCESO, APROBADA o NO APROBADA"
        );
      }
    } else {
      throw new Error("El tipo de actualizacion no es valido");
    }
  }),

  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

newVali.validateUpgradePostpone = [
  check("news", "Los ids son obligatorios").notEmpty(),
  check("news", "Los ids no son validos").isArray(),
  check("news").custom(async (news) => {
    news.forEach(async (id) => {
      await validateExistNew(id);
    });
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

newVali.validateExistNew = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id,{req}) => {
    await validateExistNew(id, req);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

newVali.validateExistImprovement = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistImprovement(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];




newVali.validateFiche = [
  check("fiche").custom(async (fiche) => {

    await validateExistFicheById(fiche);
  }),

  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

newVali.validateExistInst = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistInstrById(id);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];


newVali.validateUpdateByInst = [
  check("newid", "El id es obligatorio").notEmpty(),
  check("newid", "El id no es valido").isMongoId(),
  check("newid").custom(async (newid) => {
    await validateExistImprovement(newid);
  }),
  check("instr", "El id es obligatorio").notEmpty(),
  check("instr", "El id no es valido").isMongoId(),
  check("instr").custom(async (instr) => {
    await validateExistInstrById(instr);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

newVali.validateImprovement = [
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn([
    "PLAN DE MEJORAMIENTO",
  ]),
  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(documents),
  check("document", "El documento es obligatorio").notEmpty(),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check("phone", "El telefono no es valido").isLength({ min: 10, max: 15 }),
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche, { req }) => {
    await validateExistFicheById(fiche);
  }),
  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (competence) => {
    await validateExistCompetenceById(competence);
  }),
  check("outcome", "El resultado es obligatorio").notEmpty(),
  check("outcome", "El resultado no es valido").isMongoId(),
  check("outcome").custom(async (outcome) => {
    await validateExistOutcomeById(outcome);
  }),

  check("fend", "La fecha de finalización es obligatoria").notEmpty(),
  check("fend", "La fecha de finalización no es valida").isDate(),
  check("fend").custom(async (fend) => {
    if (new Date(fend) < new Date()) {
      throw new Error(
        "La fecha de finalización no puede ser menor a la fecha actual"
      );
    }
  }),
  check("status", "El estado es obligatorio").notEmpty(),
  check("status", "El estado no es valido").isIn([
    "REGISTRADO",
    "APROBADO",
    "NO APROBADO",
    "VENCIDO",
  ]),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    console.log(instructor);
    await validateExistInstrById(instructor);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

newVali.validateUpdateImprovement = [
  check("id", "El id es obligatorio").notEmpty(),
  check("id", "El id no es valido").isMongoId(),
  check("id").custom(async (id) => {
    await validateExistImprovement(id);
  }),
  check("tpnew", "El tipo de novedad es obligatorio").notEmpty(),
  check("tpnew", "El tipo de novedad no es valido").isIn([
    "PLAN DE MEJORAMIENTO",
  ]),
  check("tpdocument", "El tipo de documento es obligatorio").notEmpty(),
  check("tpdocument", "El tipo de documento no es valido").isIn(documents),
  check("document", "El documento es obligatorio").notEmpty(),
  check("name", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio").notEmpty(),
  check("email", "El email no es valido").isEmail(),
  check("phone", "El telefono es obligatorio").notEmpty(),
  check("phone", "El telefono no es valido").isLength({ min: 10, max: 15 }),
  check("fiche", "La ficha es obligatoria").notEmpty(),
  check("fiche", "La ficha no es valida").isMongoId(),
  check("fiche").custom(async (fiche) => {
    await validateExistFicheById(fiche);
  }),
  check("competence", "La competencia es obligatoria").notEmpty(),
  check("competence", "La competencia no es valida").isMongoId(),
  check("competence").custom(async (competence) => {
    await validateExistCompetenceById(competence);
  }),
  check("outcome", "El resultado es obligatorio").notEmpty(),
  check("outcome", "El resultado no es valido").isMongoId(),
  check("outcome").custom(async (outcome) => {
    await validateExistOutcomeById(outcome);
  }),

  check("fend", "La fecha de finalización es obligatoria").notEmpty(),
  check("fend", "La fecha de finalización no es valida").isDate(),
  check("fend").custom(async (fend) => {
    if (new Date(fend) < new Date()) {
      throw new Error(
        "La fecha de finalización no puede ser menor a la fecha actual"
      );
    }
  }),
  check("status", "El estado es obligatorio").notEmpty(),
  check("status", "El estado no es valido").isIn([
    "REGISTRADO",
    "APROBADO",
    "NO APROBADO",
    "VENCIDO",
  ]),
  check("instructor", "El instructor es obligatorio").notEmpty(),
  check("instructor", "El instructor no es valido").isMongoId(),
  check("instructor").custom(async (instructor) => {
    await validateExistInstrById(instructor);
  }),
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

newVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token);
  }),
  validateFields,
];

export { newVali };
