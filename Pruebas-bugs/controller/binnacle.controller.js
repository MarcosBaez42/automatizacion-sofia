import Binnacle from "../models/Binnacle.js";

const binnacleCtrl = {};

//aliminar todos los registros mayores a 4 meses
async function deleteOldBinnacle() {
  try {
    const binnacles = await Binnacle.find().sort({ createdAt: -1 });
    const date = new Date();
    const date2 = new Date();
    date2.setMonth(date.getMonth() - 4);

    for (let i = 0; i < binnacles.length; i++) {
      const date3 = new Date(binnacles[i].createdAt);
      if (date3 < date2) {
        await Binnacle.findByIdAndDelete(binnacles[i]._id);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

//listar la bitacora
binnacleCtrl.listBinnacle = async (req, res) => {
  try {
    //listar los primeros 200
    const binnacles = await Binnacle.find().sort({ createdAt: -1 }).limit(200);
    res.json(binnacles);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      msg: "No fue posible terminar la operacion",
    });
  }
};

//filtrar la bitacora
binnacleCtrl.filterBinnacle = async (req, res) => {
  try {
    const { datestart, dateend, type } = req.body;

    //buscar todos los registros que coincidan con el tipo(action) y el rango de fechas
    let binnacles = [];
    console.log(type);

    if (type === "TODOS" || type == null || type === undefined) {
      binnacles = await Binnacle.find({
        createdAt: { $gte: datestart, $lte: dateend },
      }).sort({ createdAt: -1 });
    } else {
      binnacles = await Binnacle.find({
        action: type.toUpperCase().trim(),
        createdAt: { $gte: datestart, $lte: dateend },
      }).sort({ createdAt: -1 });
    }

    res.json(binnacles);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      msg: "No fue posible terminar la operacion",
    });
  }
};

export { binnacleCtrl, deleteOldBinnacle };
