import Fiche from "../models/Fiche.js";

/**
 * Helper functions related to Fiche model
 * @namespace ficheHelper
 */
const ficheHelper = {};

/**
 * Validates if a Fiche with the given id exists
 * @async
 * @function validateExistFicheById
 * @memberof ficheHelper
 * @param {string} id - The id of the Fiche to validate
 * @throws {Error} If the Fiche does not exist
 */
ficheHelper.validateExistFicheById = async (id,status = 0) => {
  try {
    //buscar la ficha por id y por estado en caso de que se quiera validar una ficha activa
    const fiche = await Fiche.findOne({ _id: id, status });
    if (!fiche) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La ficha no existe");
  }
};

/**
 * Validates if a Fiche with the given number already exists
 * @async
 * @function uniqueNumberFiche
 * @memberof ficheHelper
 * @param {string} number - The number of the Fiche to validate
 * @param {string} [id=""] - The id of the Fiche to exclude from the validation
 * @throws {Error} If a Fiche with the given number already exists
 */
ficheHelper.uniqueNumberFiche = async (number, id = "") => {
  try {
    const fiche = await Fiche.findOne({ number, status: 0 });
    if (fiche && fiche._id != id) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El número de ficha ya existe");
  }
};

/**
 * Validates if a Fiche with the given number exists
 * @async
 * @function validateExistFicheByNumber
 * @memberof ficheHelper
 * @param {string} number - The number of the Fiche to validate
 * @throws {Error} If the Fiche does not exist
 */
ficheHelper.validateExistFicheByNumber = async (number) => {
  const numberFiche = number.toString().trim();
  try {
    const fiche = await Fiche.findOne({ number: numberFiche , status: 0 });

    if (!fiche) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La ficha no existe");
  }
};

ficheHelper.validateActiveFiche = async (id) => {
  try {
    const searchFiche = await Fiche.findById(id);
    if (searchFiche && searchFiche.status == 1) {
      const fiche =await Fiche.findOne({ number: searchFiche.number, status: 0 });
      if (fiche) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("ya existe una ficha activa con ese número");
  }
};

export { ficheHelper };
