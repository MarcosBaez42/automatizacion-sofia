import { Schema, model } from "mongoose";
import bcryp from "bcryptjs";
 
/**
 * @typedef {Object} User
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} role - The role of the user.
 * @property {string} password - The password of the user.
 * @property {number} super - The super status of the user.
 * @property {number} status - The status of the user.
 * @property {Date} createdAt - The date when the user was created.
 * @property {Date} updatedAt - The date when the user was last updated.
 */

const UserSquema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "PROGRAMADOR", //PROGRAMADOR, COORDINADOR, CONSULTOR, EVALUADOR, USER, NOVEDADES
    },
    //array de coordinaciones
    coordinations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Coordination",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    super: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Encrypts the password using bcrypt.
 * @memberof User
 * @function
 * @param {string} password - The password to be encrypted.
 * @returns {Promise<string>} - The encrypted password.
 */
UserSquema.methods.encryptPassword = async (password) => {
  const salt = await bcryp.genSalt(10);
  return await bcryp.hash(password, salt);
};

/**
 * Compares the password with the password in the database.
 * @memberof User
 * @function
 * @param {string} password - The password to be compared.
 * @returns {Promise<boolean>} - True if the passwords match, false otherwise.
 */
UserSquema.methods.matchPassword = async function (password) {
  return await bcryp.compare(password, this.password);
};

export default model("User", UserSquema);
