import Binnacle from "../models/Binnacle.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
/**
 * Function to get the user ID from a JWT token
 * @param {string} token - JWT token
 * @returns {string|null} - User ID or null if token is invalid
 */
function _getUserId(token) {
  const result = jwt.verify(token, process.env.JWT_SECRET, {
    algorithm: "HS256",
  });
  return result.id ? result.id : null;
}

/**
 * Function to register an action in the system's binnacle
 * @param {string} token - JWT token
 * @param {string} action - Action to register
 * @param {string} information - Additional information about the action
 */
async function registerAction(action, information = {}, token = null) {
  try {
    let user = null;
    if (token) {
      user = _getUserId(token);
    }

    let userDb = null;

    if (user && user != '123456789') {
    userDb = await User.findById(user)
    };

    
    const binnacle = new Binnacle({
      user: userDb ? userDb.name : "SISTEMA",
      correo: userDb ? userDb.email : "SISTEMA",
      action,
      information,
    });


    binnacle.save();
  } catch (error) {
    console.log(error);
  }
}

export default registerAction;
