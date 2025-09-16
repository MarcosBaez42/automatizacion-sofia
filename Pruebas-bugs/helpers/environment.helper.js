import Environment from "../models/Environment.js";
import Town from "../models/Town.js";

/**
 * Helper functions related to environment operations.
 * @namespace environmentHelper
 */
const environmentHelper = {};

/**
 * Validates if an environment with the given ID exists in the database.
 * @async
 * @function validateExistEnvironmentById
 * @memberof environmentHelper
 * @param {string} id - The ID of the environment to validate.
 * @throws {Error} If the environment does not exist.
 */
environmentHelper.validateExistEnvironmentById = async (id) => {
  try {
    const environment = await Environment.findById(id, { status: 0 });
    if (!environment) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El ambiente no existe");
  }
};

environmentHelper.validateExistEnvironmentByName = async (name, town, id = null) =>{
  try {
    const environment = await Environment.findOne({ name:name.toUpperCase().trim(), town }, { status: 0 });

    if (!id) {
      if (environment) {
        throw new Error();
      }
    } else {
      if (environment && environment._id != id) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El ambiente ya se encuentra registrado");
  }
};




/**
 * Validates if a town with the given ID exists in the database.
 * @async
 * @function validateExistTown
 * @memberof environmentHelper
 * @param {string} id - The ID of the town to validate.
 * @throws {Error} If the town does not exist.
 */
environmentHelper.validateExistTown = async (id) => {
  try {
    const town = await Town.findById(id, { status: 0 });
    if (!town) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El municipio o ciudad no existe");
  }
};

export { environmentHelper };
