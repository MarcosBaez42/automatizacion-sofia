import Competence from "../models/Competence.js";

/**
 * This object contains helper functions related to competences.
 */
const competenceHelper = {};

/**
 * Validates if a competence with the given id exists in the database.
 * @async
 * @function
 * @param {string} id - The id of the competence to validate.
 * @throws {Error} Throws an error if the competence does not exist.
 */
competenceHelper.validateExistCompetenceById = async (id) => {
  try {
    const competence = await Competence.findById(id, { status: 0 });
    if (!competence) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La competencia no existe");
  }
};

/**
 * Validates if a competence with the given number already exists in the given program.
 * @async
 * @function
 * @param {string} number - The number of the competence to validate.
 * @param {string} program - The id of the program to validate.
 * @param {string} [id=""] - The id of the competence to exclude from the validation.
 * @throws {Error} Throws an error if the competence number already exists in the program.
 */
competenceHelper.validateExistCompetenceByNumber = async (
  number,
  program,
  id = ""
) => {
  try {
    let competence = await Competence.findOne(
      { number: number, program: program , status: 0 },
    );

    if (competence) {
      if (id) {
        if (competence._id.toString() !== id) {
          throw new Error();
        }
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El numero de la competencia ya existe en el programa");
  }
};


competenceHelper.validateActiveCompetence = async (id) => {
  try {
    const searchCompetence = await Competence.findById(id);
    if(searchCompetence && searchCompetence.status === 1){
      const competence = await Competence.findOne({number: searchCompetence.number, program: searchCompetence.program, status: 0});
      if(competence){
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("Ya existe una competencia activa con ese numero en el programa");
  }
}

export { competenceHelper };
