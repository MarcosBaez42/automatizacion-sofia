

import { check } from "express-validator";
import webToken from "../middlewares/webToken.js";
import { validateFields } from "../middlewares/validateFields.js";


const { validateToken } = webToken;

const townsVali = {};


townsVali.validateHeaders = [
  check("token").custom(async (token) => {
    await validateToken(token, false);
  }),
  validateFields,
];

export { townsVali };
