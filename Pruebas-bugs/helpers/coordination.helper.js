import User from "../models/User.js";
import Coordination from "../models/Coordination.js";

/**
 * Helper functions related to coordinations
 * @namespace coordinationHelper
 */
const coordinationHelper = {};

/**
 * Validates if a coordination with the given id exists
 * @async
 * @function validateExistCoordinationById
 * @memberof coordinationHelper
 * @param {string} id - The id of the coordination to validate
 * @throws {Error} Throws an error if the coordination does not exist
 */
coordinationHelper.validateExistCoordinationById = async (id) => {
  try {
    const coordination = await Coordination.findById(id, { status: 0 });
    if (!coordination) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("La coordinacion no existe");
  }
};

/**
 * Validates if a user with the given id exists and has the role of "COORDINADOR"
 * @async
 * @function validateExistCoordinator
 * @memberof coordinationHelper
 * @param {string} id - The id of the user to validate
 * @throws {Error} Throws an error if the user does not exist or has a different role than "COORDINADOR"
 */
coordinationHelper.validateExistCoordinator = async (id) => {
  try {
    const coordinator = await User.findById(id, { status: 0 });
    console.log("coordinado", coordinator);
    if (!coordinator || coordinator.role !== "COORDINADOR") {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    throw new Error("El coordinador no existe");
  }
};


coordinationHelper.validateExistprogrammer = async (ids) => {
  try {
    const programmers = await User.find({ _id: { $in: ids }, role: "PROGRAMADOR" }, { status: 0 }); 
    if (programmers.length !== ids.length) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("Uno o mas programadores no existen");
  }
}

/**
 * Validates if an email is already registered in the coordinations collection
 * @async
 * @function validateExistEmail
 * @memberof coordinationHelper
 * @param {string} email - The email to validate
 * @param {string} [id=null] - The id of the coordination to exclude from the validation (optional)
 * @throws {Error} Throws an error if the email is already registered
 */
coordinationHelper.validateExistEmail = async (email, id = null) => {
  try {
    const coordinator = await Coordination.findOne({ email, status: 0 });
    if (coordinator) {
      if (id) {
        if (coordinator._id.toString() !== id.toString()) {
          throw new Error();
        }
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El email ya esta registrado");
  }
};


coordinationHelper.validateActiveCoordination = async (id) => {
  try {
    const searchCoordination = await Coordination.findById(id);
    if (searchCoordination && searchCoordination.status === 1) {
      const coordination = await Coordination.findOne({ email: searchCoordination.email, status: 0 });
      if (coordination) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("Ya existe una coordinación con este email");
  }
};


export { coordinationHelper };
