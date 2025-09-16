import Outcome from "../models/Outcome.js";

/**
 * Helper functions related to Outcome model
 */
const outcomeHelper = {};

/**
 * Validates if an Outcome with the given id exists
 * @param {string} id - The id of the Outcome to validate
 * @throws {Error} If the Outcome does not exist
 */
outcomeHelper.validateExistOutcomeById = async (id) => {
  try {
    const outcome = await Outcome.findById(id, { status: 0 });
    if (!outcome) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El resultado no existe");
  }
};

/**
 * Validates if an Outcome with the given code and Competence already exists
 * @param {string[]} codes - The codes of the Outcomes to validate
 * @param {string} competence - The id of the Competence to validate against
 * @param {Object} req - The request object to store validation results
 * @throws {Error} If there is an error while validating
 */
outcomeHelper.validateExistOutcomeBycode = async (codes, competence, req) => {
  try {
    //validar cuales de los codigos ya existen
    const outcomes = await Outcome.find({ code: { $in: codes }, competence, status: 0 });

    console.log("outcomes", outcomes);

    //cadena de texto con los codigos que ya existen separados por coma
    let existCodes = "";
    let codesOutcomes = outcomes.map((outcome) => outcome.code);
    outcomes.forEach((outcome) => {
      existCodes += `${outcome.code}, `;
    });

    if (outcomes.length > 0) {
      req.existOutcomes = `Algunos resultados no se registraron porque ya existen: ${existCodes}`;
      req.codesOutcomes = codesOutcomes;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Validates if an Outcome with the given code and Competence already exists, excluding the Outcome with the given id
 * @param {string} code - The code of the Outcome to validate
 * @param {string} competence - The id of the Competence to validate against
 * @param {string} id - The id of the Outcome to exclude from validation
 * @throws {Error} If the Outcome with the given code already exists
 */
outcomeHelper.validateExistOutcomeByCodeUpdate = async (
  code,
  competence,
  id
) => {
  try {
    //validar si el codigo ya existe
    const outcome = await Outcome.findOne({ code, competence, status: 0 });

    if (outcome && outcome._id.toString() !== id) {
      throw new Error("El codigo del resultado ya existe");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

outcomeHelper.validateActiveOutcome = async (id) => {
  try {
    const searchOutcome = await Outcome.findById(id);
    if(searchOutcome && searchOutcome.status === 1){
      //validar si existe un porgrama con el mismo codigo y competence
      const outcome = await Outcome.findOne({ code: searchOutcome.code,competence: searchOutcome.competence, status: 0 });
      if (outcome) {
        throw new Error()
      }
    }

  }catch (error) {
    throw new Error("Ya existe un resultado con ese codigo y competencia");
  }
}


export { outcomeHelper };
