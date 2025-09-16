import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Instructor from "../models/Instructor.js";

/**
 * Middleware for generating, validating and resetting web tokens.
 * @namespace webToken
 */

const webToken = {};

/**
 * Generates a web token.
 * @async
 * @function generateToken
 * @memberof webToken
 * @param {Object} user - The user object to generate the token for.
 * @param {string} user._id - The user's ID.
 * @param {string} user.role - The user's role.
 * @param {string} user.email - The user's email.
 * @returns {Promise<string>} The generated token.
 * @throws {Error} If there was an error generating the token.
 */

webToken.generateToken = async (user = "") => {
  const payload = {
    id: user._id || "123456789",
    rol: user.role || "USER",
    email: user.email || "",
    super: user.super || 0,
  };

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      //expira en 1 dia
      expiresIn: "48h",
      algorithm: "HS256",
    });
    return token;
  } catch (err) {
    throw new Error("Error al generar el token");
  }
};

/**
 * Validates a web token.
 * @async
 * @function validateToken
 * @memberof webToken
 * @param {string} token - The token to validate.
 * @param {boolean} isAdmin - Whether the user is an admin or not.
 * @param {boolean} isSuper - Whether the user is a super user or not.
 * @throws {Error} If the token is not provided, the user is not found, the user is inactive, or the user does not have the required permissions.
 */

webToken.validateToken = async (
  token,
  isAdmin = true,
  isSuper = false,
  isEvaluador = false,
  isNovedades = false
) => {
  try {
    if (!token) {
      throw new Error("No se ha enviado el token");
    }
  } catch (err) {
    throw new Error("No se ha enviado el token");
  }

  try {
    const result = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    if (result.rol !== "USER") {
      if (result.rol == "INSTRUCTOR") {
        isAdmin = false;
        let user = await Instructor.findById(result.id);

        if (!user) throw new Error("Usuario no encontrado");

        if (user.status !== 0) throw new Error("el usuario está inactivo");
      } else {
        let user = await User.findById(result.id);

        if (!user) throw new Error("Usuario no encontrado");

        if (user.status !== 0) throw new Error("el usuario está inactivo");
      }
    }

    if (isAdmin && result.rol === "USER") {
      throw new Error("No tienes permisos para realizar esta acción!");
    }

    if (result.rol !== "ETAPA PRODUCTIVA") {
      if (isSuper && result.rol !== "COORDINADOR") {
        throw new Error("No tienes permisos para realizar esta acción!!");
      }
    }

    if (
      isEvaluador &&
      ["COORDINADOR", "PROGRAMADOR", "EVALUADOR", "NOVEDADES"].indexOf(
        result.rol
      ) === -1
    ) {
      throw new Error("No tienes permisos para realizar esta acción!!!");
    }

    if (
      isNovedades &&
      ["COORDINADOR", "PROGRAMADOR", "EVALUADOR", "NOVEDADES"].indexOf(
        result.rol
      ) === -1
    ) {
      throw new Error("No tienes permisos para realizar esta acción!!!!");
    }
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

webToken.validateTokenInst = async (token) => {
  try {
    if (!token) {
      throw new Error("No se ha enviado el token");
    }
  } catch (err) {
    throw new Error("No se ha enviado el token");
  }

  try {
    const result = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    let user = await Instructor.findById(result.id);

    if (!user) throw new Error("Instructor no encontrado");

    if (user.status !== 0) throw new Error("el instructor está inactivo");
    
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
};

/**
 * Validates a web token for a super user.
 * @async
 * @function validateTokenSuper
 * @memberof webToken
 * @param {string} token - The token to validate.
 * @throws {Error} If the token is not provided, the user is not found, the user is inactive, or the user is not a super user.
 */

webToken.validateTokenSuper = async (token) => {
  try {
    if (!token) {
      throw new Error("No se ha enviado el token");
    }

    const result = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    let user = await User.findById(result.id);

    if (!user) throw new Error("Usuario no encontrado");
    if (user.status !== 0) throw new Error("el usuario está inactivo");

    if (user.super !== 1)
      throw new Error("No tienes permisos para realizar esta acción");
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
};

/**
 * Generates a temporary web token.
 * @async
 * @function generateTempToken
 * @memberof webToken
 * @param {string} fiche - The fiche.
 * @param {string} fstart - The start date.
 * @param {string} fend - The end date.
 * @returns {Promise<string>} The generated token.
 * @throws {Error} If there was an error generating the token.
 */

webToken.generateTempToken = async (fiche, fstart, fend) => {
  const payload = {
    fiche: fiche,
    fstart: fstart,
    fend: fend,
  };

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      //expira en 1 siglo
      expiresIn: "100y",
      algorithm: "HS256",
    });
    return token;
  } catch (err) {
    throw new Error("Error al generar el token");
  }
};

/**
 * Validates a temporary web token.
 * @async
 * @function validateTempToken
 * @memberof webToken
 * @param {string} token - The token to validate.
 * @returns {Promise<Object>} The token payload.
 * @throws {Error} If the token is not provided or is invalid.
 */

webToken.validateTempToken = async (token) => {
  console.log(token);
  try {
    if (!token) {
      throw new Error();
    }
    //verificar que la ficha exista, y que las fechas sean correctas
    const result = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });
    return result;
  } catch (err) {
    console.log(err);
    throw new Error("No se ha enviado el token");
  }
};

/**
 * Generates a web token for resetting a password.
 * @async
 * @function generateTokenResetPass
 * @memberof webToken
 * @param {Object} user - The user object to generate the token for.
 * @param {string} user.email - The user's email.
 * @param {string} user._id - The user's ID.
 * @returns {Promise<string>} The generated token.
 * @throws {Error} If there was an error generating the token.
 */

webToken.generateTokenResetPass = async (user) => {
  const payload = {
    email: user.email,
    id: user._id,
  };

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      //expira en 5 minutos
      expiresIn: "5m",
      algorithm: "HS256",
    });
    return token;
  } catch (err) {
    throw new Error("Error al generar el token");
  }
};

/**
 * Validates a web token for resetting a password.
 * @async
 * @function tokenResetPass
 * @memberof webToken
 * @param {string} token - The token to validate.
 * @returns {Promise<Object>} The token payload.
 * @throws {Error} If the token is not provided, is invalid, or the email and ID in the token do not match the user's email and ID.
 */

webToken.tokenResetPass = async (token) => {
  try {
    if (!token) {
      throw new Error();
    }

    const result = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    const user = await User.findById(result.id);

    if (result.email !== user.email && result.id !== user._id) {
      throw new Error("Token invalido");
    }

    return result;
  } catch (err) {
    //si el error es que el token expiro, se genera uno mensaje de error mas amigable
    if (err.name === "TokenExpiredError") {
      throw new Error(
        "El token ha expirado, por favor solicite nuevamente resetear su contraseña"
      );
    } else {
      throw new Error("No se ha enviado el token");
    }
  }
};

webToken.tokenResetPassInst = async (token) => {
  try {
    if (!token) {
      throw new Error();
    }

    const result = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    const user = await Instructor.findById(result.id);

    if (result.email !== user.email && result.id !== user._id) {
      throw new Error("Token invalido");
    }

    return result;
  } catch (err) {
    //si el error es que el token expiro, se genera uno mensaje de error mas amigable
    if (err.name === "TokenExpiredError") {
      throw new Error(
        "El token ha expirado, por favor solicite nuevamente resetear su contraseña"
      );
    } else {
      throw new Error("No se ha enviado el token");
    }
  }
};

export default webToken;
