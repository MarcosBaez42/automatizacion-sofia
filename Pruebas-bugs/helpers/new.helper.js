import News from "../models/News.js";
import Improvement from "../models/Improvement.js";

const newHelper = {};

newHelper.validateExistNew = async (id,req) => {
  try {
    const newSearch = await News.findById(id);
    
    if (!newSearch) {
      throw new Error();
    }
    req.newbd=newSearch
  } catch (error) {
    throw new Error("La novedad no existe");
  }
};

newHelper.validateActiveNew = async (id) => {
  try {
    const newSearch = await News.findById(id, { status: 0 });
    if (!newSearch) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La novedad no existe");
  }
};

newHelper.validateExistImprovement = async (id) => {
  try {
    const ImprovementSearch = await Improvement.findById(id, { status: 0 });
    if (!ImprovementSearch) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La novedad no existe");
  }
};

newHelper.validateDuplicateNew = async (document, tpnew, fiche) => {
  try {
    const searchNew = await News.find({
      document: document,
      tpnew: tpnew,
      fiche: fiche,
      status: 0,
      state: { $nin: ["APROBADA", "NO APROBADA"] },
    });

    console.log(searchNew);
    if (searchNew.length > 0) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La novedad ya ha sido registrada con anterioridad");
  }
};

export { newHelper };
