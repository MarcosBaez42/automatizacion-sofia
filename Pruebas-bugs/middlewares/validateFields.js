/**
 * Middleware function that validates the fields of a request using express-validator.
 * If there are validation errors, it sends a 400 response with an error message and the list of errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
import { validationResult } from "express-validator";

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((error) => {
      return error.msg;
    });

    console.log(err);

    return res.status(400).json({ msg: "Error en la validacion", errors: err });
  }
  next();
};

export { validateFields };
