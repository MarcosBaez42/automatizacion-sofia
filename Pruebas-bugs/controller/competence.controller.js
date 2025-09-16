import Competence from "../models/Competence.js";
import registerAction from "../middlewares/binnacle.js";

const competenceCtrl = {};

//register new competence in the db
competenceCtrl.registerCompetence = async (req, res) => {
  const { name, number, program } = req.body;
  try {
    const newCompetence = new Competence({
      name: name.toUpperCase().trim(),
      number,
      program,
    });
    await newCompetence.save();

    await registerAction(
      "COMPETENCIA",
      {
        event: "REGISTRAR COMPETENCIA",
        data: newCompetence,
      },
      req.headers.token
    );
    res.json({ msg: "Competencia registrada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update competence in the db
competenceCtrl.updateCompetence = async (req, res) => {
  const { id } = req.params;
  const { name, number, program } = req.body;

  try {
    await Competence.findByIdAndUpdate(id, {
      name: name.toUpperCase().trim(),
      number,
      program,
    });
    await registerAction(
      "COMPETENCIA",
      {
        event: "ACTUALIZAR COMPETENCIA",
        data: { name, number, program },
      },
      req.headers.token
    );

    res.json({ msg: "Competencia actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all competence by program
competenceCtrl.getProgramCompetence = async (req, res) => {
  const { id } = req.params;
  try {
    const competences = await Competence.find({ program: id, status: 0 }).sort({
      createdAt: -1,
    });
    res.json(competences);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all competences
competenceCtrl.getCompetences = async (req, res) => {
  const { status } = req.query;
  try {
    const competences = await Competence.find(status ? { status } : {})
      .populate("program")
      .sort({ createdAt: -1 });
    res.json(competences);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get competence by id
competenceCtrl.getCompetenceId = async (req, res) => {
  const { id } = req.params;
  try {
    const competence = await Competence.findById(id).populate("program");
    res.json(competence);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active competence in the db
competenceCtrl.activeCompetence = async (req, res) => {
  const { id } = req.params;
  try {
    await Competence.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "COMPETENCIA",
      {
        event: "ACTIVAR COMPETENCIA",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Competencia activada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate competence in the db
competenceCtrl.inactiveCompetence = async (req, res) => {
  const { id } = req.params;
  try {
    await Competence.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "COMPETENCIA",
      {
        event: "DESACTIVAR COMPETENCIA",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Competencia desactivada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { competenceCtrl };
