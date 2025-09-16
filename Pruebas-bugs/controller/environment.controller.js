import Environment from "../models/Environment.js";
import registerAction from "../middlewares/binnacle.js";

const environmentCtrl = {};

//register new environment in the db
environmentCtrl.registerEnvironment = async (req, res) => {
  const { name, description, town } = req.body;
  try {
    const newEnvironment = new Environment({
      name: name.toUpperCase().trim(),
      description: description.toUpperCase().trim(),
      town,
    });
    await newEnvironment.save();
    await registerAction(
      "AMBIENTE",
      {
        event: "REGISTRAR AMBIENTE",
        data: newEnvironment,
      },
      req.headers.token
    );
    res.json({ msg: "Ambiente registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update environment
environmentCtrl.updateEnvironment = async (req, res) => {
  const { id } = req.params;
  const { name, description, town } = req.body;

  try {
    await Environment.findByIdAndUpdate(id, {
      name: name.toUpperCase().trim(),
      description: description.toUpperCase().trim(),
      town,
    });
    await registerAction(
      "AMBIENTE",
      {
        event: "ACTUALIZAR AMBIENTE",
        data: { name, description, town },
      },
      req.headers.token
    );
    res.json({ msg: "Ambiente actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all environments
environmentCtrl.getEnvironments = async (req, res) => {
  const { status } = req.query;
  try {
    const environment = await Environment.find(status ? { status } : {})
      .populate("town")
      .sort({ createdAt: -1 });
    res.json(environment);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get environment by id
environmentCtrl.getEnvironmentId = async (req, res) => {
  const { id } = req.params;
  try {
    const environment = await Environment.findById(id).populate("town");
    res.json(environment);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active environment in the db
environmentCtrl.activeEnvironment = async (req, res) => {
  const { id } = req.params;
  try {
    await Environment.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "AMBIENTE",
      {
        event: "ACTIVAR AMBIENTE",
        data: { id },
      },
      req.headers.token
    );

    res.json({ msg: "Ambiente activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate environment in the db
environmentCtrl.inactiveEnvironment = async (req, res) => {
  const { id } = req.params;
  try {
    await Environment.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "AMBIENTE",
      {
        event: "INACTIVAR AMBIENTE",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Ambiente inactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { environmentCtrl };
