import User from "../models/User.js";

/**
 * Helper functions related to User model
 * @namespace userHelper
 */
const userHelper = {};

/**
 * Validates if email is unique in the User model
 * @async
 * @function validateEmailUnique
 * @memberof userHelper
 * @param {string} email - Email to validate
 * @param {string} [id=""] - Optional id to exclude from validation
 * @throws {Error} Throws an error if email is not unique
 * @returns {Promise<void>}
 */
userHelper.validateEmailUnique = async (email, id = "") => {
  try {
    const users = await User.findOne({ email, status: 0 });
    console.log("users", users);

    if (!id) {
      if (users) {
        throw new Error();
      }
    } else {
      if (users && users._id != id) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El email ya existe");
  }
};

/**
 * Validates if a user with the given id exists in the User model
 * @async
 * @function validateExistUserById
 * @memberof userHelper
 * @param {string} id - Id of the user to validate
 * @throws {Error} Throws an error if user does not exist
 * @returns {Promise<void>}
 */
userHelper.validateExistUserById = async (id) => {
  try {
    const users = await User.findById(id, { status: 0 });
    if (!users) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El usuario no existe!!");
  }
};

/**
 * Validates if a user with the given email exists in the User model
 * @async
 * @function validateExistEmail
 * @memberof userHelper
 * @param {string} email - Email of the user to validate
 * @throws {Error} Throws an error if user does not exist
 * @returns {Promise<void>}
 */
userHelper.validateExistEmail = async (email) => {
  try {
    const user = await User.findOne({ email, status: 0 });
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El usuario no existe!!!");
  }
};

userHelper.checkUserActive = async (id) => {
  try {
    const searchUser = await User.findById(id);

    //validar que otro usuario no tenga el mismo email
    if (searchUser && searchUser.status == 1) {
      const user = await User.findOne({ email: searchUser.email, status: 0 });
      if (user) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("Ya existe un usuario con ese email");
  }
};

export { userHelper };
