import Coordination from "../models/Coordination.js";
import registerAction from "../middlewares/binnacle.js";

const coordinationCtrl = {};

//register new coordination
coordinationCtrl.registerCoordination = async (req, res) => {
  const { name, coordinator, modality, email, passapp ,namefoldernew, programmers} = req.body;
  try {
    const newCoordination = new Coordination({
      name: name.toUpperCase().trim(),
      coordinator,
      modality: modality.toUpperCase().trim(),
      email,
      passapp,
      namefoldernew,
      programmers
    });
    await newCoordination.save();
    await registerAction(
      "COORDINACION",
      {
        event: "REGISTRAR COORDINACION",
        data: newCoordination,
      },
      req.headers.token
    );
    res.json({ msg: "Coordinacion registrada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update coordination
coordinationCtrl.updateCoordination = async (req, res) => {
  const { id } = req.params;
  const { name, coordinator, modality, email, passapp,namefoldernew, programmers } = req.body;

  try {
    await Coordination.findByIdAndUpdate(id, {
      name: name.toUpperCase().trim(),
      coordinator,
      modality: modality.toUpperCase().trim(),
      email,
      passapp,
      namefoldernew,
      programmers
    });
    await registerAction(
      "COORDINACION",
      {
        event: "ACTUALIZAR COORDINACION",
        data: { name, coordinator, modality, email, passapp,namefoldernew, programmers },
      },
      req.headers.token
    );
    res.json({ msg: "Coordinacion actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all coordinations
coordinationCtrl.getCoordinations = async (req, res) => {
  const { status } = req.query;
  try {
    const coordination = await Coordination.find(status ? { status } : {})
      .populate("coordinator programmers")
      .sort({ createdAt: -1 });
    res.json(coordination);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get coordination by id
coordinationCtrl.getCoordinationId = async (req, res) => {
  const { id } = req.params;
  try {
    const coordination = await Coordination.findById(id).populate("coordinator programmers")
    res.json(coordination);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active coordination in the db
coordinationCtrl.activeCoordination = async (req, res) => {
  const { id } = req.params;
  try {
    await Coordination.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "COORDINACION",
      {
        event: "ACTIVAR COORDINACION",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Coordinacion activada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate coordination in the db
coordinationCtrl.inactiveCoordination = async (req, res) => {
  const { id } = req.params;
  try {
    await Coordination.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "COORDINACION",
      {
        event: "DESACTIVAR COORDINACION",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Coordinacion desactivada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { coordinationCtrl };
