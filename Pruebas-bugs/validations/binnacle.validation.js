import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";

const { validateTokenSuper } = webToken;
const binnacleVali = {};

binnacleVali.validateFilter = [
  check("datestart", "La fecha de inicio es obligatoria").notEmpty(),
  check("dateend", "La fecha de fin es obligatoria").notEmpty(),
  //validar que la diferencia entre las fechas no sea mayor a 3 meses
  check("datestart").custom((datestart, { req }) => {
    const date1 = new Date(datestart);
    const date2 = new Date(req.body.dateend);


    const date3 = new Date();
    date3.setMonth(date3.getMonth() - 3);
    if (date1 > date2) {
      throw new Error(
        "La fecha de inicio no puede ser mayor a la fecha de fin"
      );
    }
    //validar que la diferencia entre la datestart y la dateend no sea mayor a 3 meses
    const diff = date2.getTime() - date1.getTime();
    const diffDays = diff / (1000 * 60 * 60 * 24);
    if (diffDays > 90) {
      throw new Error("El rango de fechas no puede ser mayor a 3 meses");
    }
    return true;
  }),
  check("type", "El tipo de acción es obligatorio").notEmpty(),
  check("token").custom(async (token) => {
    await validateTokenSuper(token);
  }),
  validateFields,
];

binnacleVali.validateToken = [
  check("token").custom(async (token) => {
    await validateTokenSuper(token);
  }),
  validateFields,
];

export { binnacleVali };
