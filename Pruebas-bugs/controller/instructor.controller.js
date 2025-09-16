import Instructor from "../models/Instructor.js";
import registerAction from "../middlewares/binnacle.js";
import webToken from "../middlewares/webToken.js";
import sendEmail from "../utils/emails/sendEmail.js";

const instrCtrl = {};

//register new instructor in the db
instrCtrl.registerInstr = async (req, res) => {
  const {
    name,
    tpdocument,
    numdocument,
    emailpersonal,
    email,
    phone,
    knowledge,
    thematicarea,
    bindingtype,
    caphour,
    password = "12345678",
  } = req.body;

  try {
    const newInstr = new Instructor({
      name: name.toUpperCase().trim(),
      tpdocument: tpdocument.toUpperCase().trim(),
      numdocument: numdocument.trim(),
      emailpersonal: emailpersonal.toUpperCase().trim(),
      email: email.toUpperCase().trim(),
      phone,
      knowledge: knowledge.toUpperCase().trim(),
      thematicarea: thematicarea.toUpperCase().trim(),
      bindingtype: bindingtype.toUpperCase().trim(),
      caphour,
    });
    
    newInstr.password = await newInstr.encryptPassword(password);
    await newInstr.save();
    await registerAction(
      "INSTRUCTOR",
      {
        event: "REGISTRAR INSTRUCTOR",
        data: newInstr,
      },
      req.headers.token
    );
    res.json({ msg: "Instructor registrado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update instructor in the db
instrCtrl.updateInstr = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    tpdocument,
    emailpersonal,
    numdocument,
    email,
    phone,
    knowledge,
    thematicarea,
    bindingtype,
    caphour,
  } = req.body;

  try {
    await Instructor.findByIdAndUpdate(id, {
      name: name.toUpperCase().trim(),
      tpdocument: tpdocument.toUpperCase().trim(),
      numdocument: numdocument.trim(),
      emailpersonal: emailpersonal.toUpperCase().trim(),
      email: email.toUpperCase().trim(),
      phone,
      knowledge: knowledge.toUpperCase().trim(),
      thematicarea: thematicarea.toUpperCase().trim(),
      bindingtype: bindingtype.toUpperCase().trim(),
      caphour,
    });
    await registerAction(
      "INSTRUCTOR",
      {
        event: "ACTUALIZAR INSTRUCTOR",
        data: { name, tpdocument, numdocument, email, phone },
      },
      req.headers.token
    );
    res.json({ msg: "Instructor actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

instrCtrl.loginUser = async (req, res) => {
  const { email, password } = req.body;
 
  let token = null;
  try {
    const user = await Instructor.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });

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
          name: user.name,
        },
      },
      null
    );

    res.json({
      msg: "Usuario logueado correctamente",
      token,
      email,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

instrCtrl.validateTokenLogin=async(req,res)=>{
  // const {token}=req.headers
  // await webToken.validateToken(token, true, true);
  res.json({token:true})
}

//get all instructors
instrCtrl.getInstrs = async (req, res) => {
  const { status } = req.query;
  try {
    const instrs = await Instructor.find(status ? { status } : {}).sort({
      createdAt: -1,
    });
    res.json(instrs);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get instructor by id
instrCtrl.getInstrId = async (req, res) => {
  const { id } = req.params;
  try {
    const instr = await Instructor.findById(id);
    res.json(instr);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active instructor in the db
instrCtrl.activeInstr = async (req, res) => {
  const { id } = req.params;
  try {
    await Instructor.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "INSTRUCTOR",
      {
        event: "ACTIVAR INSTRUCTOR",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Usuario activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//deactive instructor in the db
instrCtrl.inactiveInstr = async (req, res) => {
  const { id } = req.params;
  try {
    await Instructor.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "INSTRUCTOR",
      {
        event: "DESACTIVAR INSTRUCTOR",
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
 * Reset password function.
 * @async
 * @function resetPassword
 * @memberof userCtrl
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.email - The email of the user to reset password.
 * @returns {Object} The response object with a message.
 */

instrCtrl.resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    //buscar usuario por email

    const user = await Instructor.findOne({ email: new RegExp('^' + email + '$', 'i') });

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
instrCtrl.changePassword = async (req, res) => {
  const { token } = req.headers;
  const { password } = req.body;
  try {
    console.log("mitoken",token);
    const dataToken = await webToken.tokenResetPassInst(token);
    console.log(dataToken);
    if (!dataToken) {
      return res.status(400).json({ msg: "Token invalido" });
    }

    const passwordEncrypt = new User({ password });
    passwordEncrypt.password = await passwordEncrypt.encryptPassword(password);

    await Instructor.findByIdAndUpdate(dataToken.id, {
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

instrCtrl.changePasswordInst = async (req, res) => {
  const { token } = req.headers;
  const { password } = req.body;
  try {

    const dataToken = await webToken.tokenResetPassInst(token);
    if (!dataToken) {
      return res.status(400).json({ msg: "Token invalido" });
    }

    const passwordEncrypt = new Instructor({ password });
    passwordEncrypt.password = await passwordEncrypt.encryptPassword(password);

    await Instructor.findByIdAndUpdate(dataToken.id, {
      password: passwordEncrypt.password,
    });
 
    await registerAction(
      "INSTRUCTOR",
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
export { instrCtrl };
