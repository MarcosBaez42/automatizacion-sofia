/**
 * @fileoverview This file contains the controller functions for managing users in the database.
 * @module usersController
 * @requires ../models/User.js
 * @requires ../utils/emails/sendEmail.js
 * @requires ../middlewares/webToken.js
 */

import User from "../models/User.js";
import sendEmail from "../utils/emails/sendEmail.js";
import webToken from "../middlewares/webToken.js";
import registerAction from "../middlewares/binnacle.js";

/**
 * Controller functions for managing users in the database.
 * @namespace userCtrl
 */

const userCtrl = {};

/**
 * Login user function.
 * @async
 * @function loginUser
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.role - The role of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @returns {Object} The response object with a message, token, email, and role.
 */

userCtrl.loginUser = async (req, res) => {
  const { role, email, password } = req.body;
  let token = null;
  try {
    if (role === "ADMIN" || role==="ETAPA PRODUCTIVA") {
      const user = await User.findOne({ email, status: 0 });
      if (!user) {
        return res.status(401).json({ msg: "Credenciales incorrectas" });
      }
      const matchPassword = await user.matchPassword(password);
      if (!matchPassword) {
        return res.status(401).json({ msg: "Credenciales incorrectas" });
      } 
      token = await webToken.generateToken(user);
 
      await registerAction(
        "LOGIN",
        {
          event: "INICIO DE SESION",
          data: {
            email: user.email,
            role: user.role,
            name: user.name,
          },
        },
        null
      );

      res.json({
        msg: "Usuario logueado correctamente",
        token,
        email,
        role: user.role,
        name: user.name,
      });
    } else {
      token = await webToken.generateToken();
      return res.json({
        msg: "Usuario logueado correctamente",
        token,
        email,
        role,
     
      });
    }
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

userCtrl.validateTokenLogin=async(req,res)=>{
  // const {token}=req.headers
  // await webToken.validateToken(token, true, true);
  res.json({token:true})
}

/**
 * Register user function.
 * @async
 * @function registerUser
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.name - The name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.role - The role of the user.
 * @returns {Object} The response object with a message.
 */

userCtrl.registerUser = async (req, res) => {
  const { name, email, password, role, coordinations } = req.body;
  try {
    let data = {
      name: name.toUpperCase().trim(),
      email,
      role,
      password,
    };

    if (role === "NOVEDADES" && coordinations.length != 0) {
      data.coordinations = coordinations;
    }

    const newUser = new User(data);
    newUser.password = await newUser.encryptPassword(password);
    await newUser.save();
    await registerAction(
      "USUARIO",
      {
        event: "REGISTRAR USUARIO",
        data: newUser,
      },
      req.headers.token
    );
    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Update user function.
 * @async
 * @function updateUser
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The id of the user to update.
 * @param {string} req.body.name - The name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.role - The role of the user.
 * @returns {Object} The response object with a message and the updated user.
 */

userCtrl.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, coordinations } = req.body;
  try {
    const passwordEncrypt = new User({ password });
    passwordEncrypt.password = await passwordEncrypt.encryptPassword(password);

    let data = {
      name: name.toUpperCase().trim(),
      email,
      role,
      password: passwordEncrypt.password,
    };

    if (role === "NOVEDADES" && coordinations.length != 0) {
      data.coordinations = coordinations;
    }

    await User.findByIdAndUpdate(id, data);
    const user = await User.findById(id);
    await registerAction(
      "USUARIO",
      {
        event: "ACTUALIZAR USUARIO",
        data: { name, email, role },
      },
      req.headers.token
    );
    res.json({ msg: "Usuario actualizado correctamente", user });
  } catch (error) {

    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Get coordinators function.
 * @async
 * @function getCoodinators
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with an array of coordinators.
 */

userCtrl.getCoodinators = async (req, res) => {
  try {
    const users = await User.find({ status: 0, role: "COORDINADOR", super: 0 })
    .populate("coordinations")
    .populate({
      path: "coordinations",
      populate: {
        path: "coordinator",
        model: "User",
      },
    })
    res.json(users);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

userCtrl.getPogrammers = async (req, res) => {
  try {
    const users = await User.find({ status: 0, role: "PROGRAMADOR" })
    .populate("coordinations")
    .populate({
      path: "coordinations",
      populate: {
        path: "coordinator",
        model: "User",
      },
    })
    res.json(users);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Get all users function.
 * @async
 * @function getUsers
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with an array of users.
 */

userCtrl.getUsers = async (req, res) => {
  try {
    const users = await User.find({ super: 0 })
    .populate("coordinations")
    .populate({
      path: "coordinations",
      populate: {
        path: "coordinator",
        model: "User",
      },
    })
    .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Get user by id function.
 * @async
 * @function getUserId
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The id of the user to get.
 * @returns {Object} The response object with the user.
 */

userCtrl.getUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id)
    .populate("coordinations")
    .populate({
      path: "coordinations",
      populate: {
        path: "coordinator",
        model: "User",
      },
    });
    res.json({ user });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Activate user function.
 * @async
 * @function activeUser
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The id of the user to activate.
 * @returns {Object} The response object with a message.
 */

userCtrl.activeUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "USUARIO",
      {
        event: "ACTIVAR USUARIO",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Usuario activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Deactivate user function.
 * @async
 * @function inactiveUser
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The id of the user to deactivate.
 * @returns {Object} The response object with a message.
 */

userCtrl.inactiveUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "USUARIO",
      {
        event: "DESACTIVAR USUARIO",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Usuario desactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Logout user function.
 * @async
 * @function logoutUser
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a message.
 */

userCtrl.logoutUser = async (req, res) => {
  try {
    res.json({ msg: "Usuario deslogueado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Reset password function.
 * @async
 * @function resetPassword
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.email - The email of the user to reset password.
 * @returns {Object} The response object with a message.
 */

userCtrl.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    //buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Usuario no encontrado" });
    }

    const token = await webToken.generateTokenResetPass(user);
    console.log(`${process.env.URL_FRONTEND}/resetpassword/${token}`);

    await sendEmail(
      process.env.FROM_EMAIL,
      process.env.SECURY_EMAIL,
      [email],
      "RESTABLECER CONTRASEÑA",
      {
        name: user.name,
        url: `${process.env.URL_FRONTEND}/resetpassword/${token}`,
      },
      "./template/resertPassword.hbs"
    );
    await registerAction(
      "USUARIO",
      {
        event: "SOLICITAR RESTABLECER CONTRASEÑA",
        data: { email },
      },
      null
    );

    return res.json({ msg: "Email enviado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Change password function.
 * @async
 * @function changePassword
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.token - The token for resetting the password.
 * @param {string} req.body.password - The new password.
 * @returns {Object} The response object with a message.
 */
userCtrl.changePassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const dataToken = await webToken.tokenResetPass(token);
    if (!dataToken) {
      return res.status(400).json({ msg: "Token invalido" });
    }

    const passwordEncrypt = new User({ password });
    passwordEncrypt.password = await passwordEncrypt.encryptPassword(password);

    await User.findByIdAndUpdate(dataToken.id, {
      password: passwordEncrypt.password,
    });

    await registerAction(
      "USUARIO",
      {
        event: "RESTABLECER CONTRASEÑA",
        data: { id: dataToken.id },
      },
      null
    );

    return res.json({ msg: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { userCtrl };
