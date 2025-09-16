import Instructor from "../models/Instructor.js";

/**
 * A collection of helper functions for working with Instructor objects.
 * @namespace
 */
const instrHelper = {};

/**
 * Validates that an email is unique among all active instructors.
 * @async
 * @function
 * @param {string} email - The email to validate.
 * @param {string} [id=""] - The ID of the instructor to exclude from the search.
 * @throws {Error} Throws an error if the email is not unique.
 */
instrHelper.validateEmailUnique = async (email, id = "") => {
  try {
    const instrs = await Instructor.findOne({ email, status: 0 });

    if (!id) {
      if (instrs) {
        throw new Error();
      }
    } else {
      if (instrs && instrs._id != id) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El email institucional ya se encuentra registrado");
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
instrHelper.validateExistEmail = async (email) => {
  try {

    const user = await Instructor.findOne({  email: new RegExp('^' + email + '$', 'i') , status: 0 });

    if (!user) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El usuario no existe!");
  }
};

/**
 * Validates that a personal email is unique among all active instructors.
 * @async
 * @function
 * @param {string} emailpersonal - The personal email to validate.
 * @param {string} [id=""] - The ID of the instructor to exclude from the search.
 * @throws {Error} Throws an error if the personal email is not unique.
 */
instrHelper.validateEmailPersonalUnique = async (emailpersonal, id = "") => {
  try {
    const instrs = await Instructor.findOne({ emailpersonal, status: 0 });

    if (!id) {
      if (instrs) {
        throw new Error();
      }
    } else {
      if (instrs && instrs._id != id) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El email personal ya se encuentra registrado");
  }
};

/**
 * Validates that an instructor with the given ID exists.
 * @async
 * @function
 * @param {string} id - The ID of the instructor to validate.
 * @throws {Error} Throws an error if the instructor does not exist.
 */
instrHelper.validateExistInstrById = async (id) => {
  try {
    const instr = await Instructor.findById(id, { status: 0 });
    if (!instr) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El instructor no existe");
  }
};

/**
 * Validates that a document number is unique among all active instructors.
 * @async
 * @function
 * @param {string} numdocument - The document number to validate.
 * @param {string} [id=""] - The ID of the instructor to exclude from the search.
 * @throws {Error} Throws an error if the document number is not unique.
 */
instrHelper.validateDocuUnique = async (numdocument, id = "") => {
  try {
    const instr = await Instructor.findOne({ numdocument, status: 0 });
    console.log(instr);
    if (!id) {
      if (instr) {
        throw new Error();
      }
    } else {
      if (instr && instr._id != id) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("El documento ya se encuentra registrado");
  }
};

/**
 * Validates if an Instructor with the given document and email exists
 * @async
 * @function validateInfoInst
 * @memberof instrHelper
 * @param {string} document - The document number of the Instructor to validate
 * @param {string} email - The email of the Instructor to validate
 * @throws {Error} If the Instructor does not exist or the email does not match
 */
instrHelper.validateInfoInst = async (document, email) => {
  try {
    const instructor = await Instructor.findOne({
      numdocument: document,
    });

    if (!instructor) {
      throw new Error();
    }

    if (instructor.email.toLocaleLowerCase() != email.toLocaleLowerCase() && instructor.emailpersonal.toLocaleLowerCase() != email.toLocaleLowerCase()) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El instructor no existe");
  }
};

instrHelper.validateActiveInstr= async (id) => {
  try {
    const searchInstr = await Instructor.findById(id);
    if (searchInstr && searchInstr.status == 1) {
      //validar si existe un instructor con el mismo documento
      const instr = await Instructor.findOne({numdocument: searchInstr.numdocument, status: 0 });
      if (instr) {
        throw new Error();
      }
    }
  } catch (error) {
    throw new Error("Ya existe un instructor con el mismo documento");
  }
}

instrHelper.validateExistInstById = async (id) => {
  try {
    const instr = await Instructor.findById(id, { status: 0 });
    if (!instr) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El instructor no existe");
  }
};

export { instrHelper };
