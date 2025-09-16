import Program from "../models/Program.js";
import registerAction from "../middlewares/binnacle.js";

const programCtrl = {};

//register new program in the db
programCtrl.registerProgram = async (req, res) => {
  const { code, name, version } = req.body;
  try {
    const newProgram = new Program({
      code,
      name: name.toUpperCase().trim(),
      version,
    });
    await newProgram.save();
    await registerAction(
      "PROGRAMA",
      {
        event: "REGISTRAR PROGRAMA",
        data: newProgram,
      },
      req.headers.token
    );
    res.json({ msg: "Programa registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update program in the db
programCtrl.updateProgram = async (req, res) => {
  const { id } = req.params;
  const { code, name, version } = req.body;

  try {
    await Program.findByIdAndUpdate(id, {
      code,
      name: name.toUpperCase().trim(),
      version,
    });
    await registerAction(
      "PROGRAMA",
      {
        event: "ACTUALIZAR PROGRAMA",
        data: { code, name, version },
      },
      req.headers.token
    );
    res.json({ msg: "Programa actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all programs
programCtrl.getPrograms = async (req, res) => {
  const { status } = req.query;
  try {
    const programs = await Program.find(status ? { status } : {}).sort({
      createdAt: -1,
    });
    res.json(programs);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get program by id
programCtrl.getProgramId = async (req, res) => {
  const { id } = req.params;
  try {
    const program = await Program.findById(id);
    res.json(program);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active program in the db
programCtrl.activeProgram = async (req, res) => {
  const { id } = req.params;
  try {
    await Program.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "PROGRAMA",
      {
        event: "ACTIVAR PROGRAMA",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Programa activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate program in the db
programCtrl.inactiveProgram = async (req, res) => {
  const { id } = req.params;
  try {
    await Program.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "PROGRAMA",
      {
        event: "INACTIVAR PROGRAMA",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Programa inactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { programCtrl };
