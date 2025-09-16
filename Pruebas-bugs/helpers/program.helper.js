import Program from "../models/Program.js";

/**
 * A collection of helper functions for working with Program models.
 * @namespace programHelper
 */
const programHelper = {};

/**
 * Validates the existence of a Program model by ID.
 * @async
 * @function validateExistProgramById
 * @memberof programHelper
 * @param {string} id - The ID of the Program model to validate.
 * @throws {Error} If the Program model does not exist.
 */
programHelper.validateExistProgramById = async (id) => {
  try {
    const program = await Program.findById(id, { status: 0 });
    if (!program) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El programa no existe");
  }
};


programHelper.uniqueCodeProgram = async (code,version, id = "") => {
  try {
    const program = await Program.findOne({ code,version, status: 0 });
    if (program) {
      if (id) {
        if (program._id.toString() !== id) {
          throw new Error();
        }
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El codigo del programa ya existe");
  }
}

programHelper.validateActiveProgram = async (id) => {
  try {
    const searchProgram = await Program.findById(id);

    if(searchProgram && searchProgram.status === 1){
      //validar si existe un porgrama con el mismo codigo y version
      const program = await Program.findOne({ code: searchProgram.code,version: searchProgram.version, status: 0 });
      if (program) {
        throw new Error()
      }
    }
  }catch (error) {
    throw new Error("Ya existe un programa con ese codigo y version");
  }
}



export { programHelper };
