import Fiche from "../models/Fiche.js";
import registerAction from "../middlewares/binnacle.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Coordination from "../models/Coordination.js";

const ficheCtrl = {};


function getUserToken(token) {
  const result = jwt.verify(token, process.env.JWT_SECRET, {
    algorithm: "HS256",
  });
  return result.id;
}

async function getCoordinationsSearch(token) {
  try {
    let consult = {};
    const user = await User.findById(getUserToken(token));
    if (user && user.role === "COORDINADOR" && user.super !== 1) {
      const coor = await Coordination.find({ coordinator: user._id });
      coor ? (consult = { coordination: { $in: coor } }) : null;
    } else if (user && user.role === "PROGRAMADOR" && user.super !== 1) {
      const programmers = await Coordination.find({ programmers: user._id });

      programmers ? (consult = { coordination: { $in: programmers } }) : null;
    } else if (user && user.role === "NOVEDADES" && user.super !== 1) {
      user.coordinations
        ? (consult = { coordination: { $in: user.coordinations } })
        : null;
    }

    return {
      status: 0,
      ...consult,
    };
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
}

//register new fiche in the db
ficheCtrl.registerFiche = async (req, res) => {
  const { number, program, coordination, owner, fstart, fend } = req.body;

  try {
    const newFiche = new Fiche({
      number,
      program,
      owner,
      coordination,
      fstart,
      fend,
    });
    await newFiche.save();
    await registerAction(
      "FICHA",
      {
        event: "REGISTRAR FICHA",
        data: newFiche,
      },
      req.headers.token
    );
    res.json({ msg: "Ficha registrada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update fiche in the db
ficheCtrl.updateFiche = async (req, res) => {
  const { id } = req.params;
  const { number, program, coordination, owner, fstart, fend } = req.body;

  try {
    await Fiche.findByIdAndUpdate(id, {
      number,
      program,
      owner,
      coordination,
      fstart,
      fend,
    });
    await registerAction(
      "FICHA",
      {
        event: "ACTUALIZAR FICHA",
        data: { number, program, coordination, owner },
      },
      req.headers.token
    );
    res.json({ msg: "Ficha actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all fiches
ficheCtrl.getFiches = async (req, res) => {
  const { status } = req.query;
  try {
    const fiches = await Fiche.find(status ? { status } : {})
      .populate("program owner coordination")
      .sort({ createdAt: -1 });
    res.json(fiches);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get fiches by coordination
ficheCtrl.getFichesCoordination = async (req, res) => {
  const { token } = req.headers;

  try {
    const consult = await getCoordinationsSearch(token);
    console.log(consult);
    const fiches = await Fiche.find(consult)
      .populate("program owner coordination")
      .sort({ createdAt: -1 });
    res.json(fiches);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion jejejej" });
  }
};


//get all fiches
ficheCtrl.getFichesPublic = async (req, res) => {
  try {
    const fiches = await Fiche.find({status: 0})
      .populate("program")
      .sort({ createdAt: -1 });
    res.json(fiches);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get fiche by id
ficheCtrl.getFicheId = async (req, res) => {
  const { id } = req.params;
  try {
    const fiche = await Fiche.findById(id).populate(
      "program owner coordination"
    );
    res.json(fiche);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active fiche in the db
ficheCtrl.activeFiche = async (req, res) => {
  const { id } = req.params;
  try {
    await Fiche.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "FICHA",
      {
        event: "ACTIVAR FICHA",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Ficha activada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate fiche in the db
ficheCtrl.inactiveFiche = async (req, res) => {
  const { id } = req.params;
  try {
    await Fiche.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "FICHA",
      {
        event: "INACTIVAR FICHA",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Ficha inactivada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { ficheCtrl };
