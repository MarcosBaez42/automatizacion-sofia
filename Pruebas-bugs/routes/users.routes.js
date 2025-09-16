import { Router } from "express";
import { userCtrl } from "../controller/users.controller.js";
import { usersVali } from "../validations/users.validation.js";

/**
 * Controller functions containing validation functions for user login, registration, existence, update, email, password change, and headers.
 * @typedef {Object} UsersValidation
 * @property {Function} validateLoginUser - Validates user login credentials.
 * @property {Function} validateRegisterUser - Validates user registration credentials.
 * @property {Function} validateExistUser - Validates user existence.
 * @property {Function} validateUpdateUser - Validates user update credentials.
 * @property {Function} validateEmail - Validates user email.
 * @property {Function} validateChangePassword - Validates user password change credentials.
 * @property {Function} validateHeaders - Validates user headers.
 * @property {Function} validateHeadersSuper - Validates superuser headers.
 */

/**
 * Validation functions functions for getting user ID, coordinators, logging in, registering, getting users, updating, activating, deactivating, logging out, resetting password, and changing password.
 * @typedef {Object} UserController
 * @property {Function} getUserId - Gets user ID.
 * @property {Function} getCoodinators - Gets coordinators.
 * @property {Function} loginUser - Logs in user.
 * @property {Function} registerUser - Registers user.
 * @property {Function} getUsers - Gets users.
 * @property {Function} updateUser - Updates user.
 * @property {Function} activeUser - Activates user.
 * @property {Function} inactiveUser - Deactivates user.
 * @property {Function} logoutUser - Logs out user.
 * @property {Function} resetPassword - Resets user password.
 * @property {Function} changePassword - Changes user password.
 */

const {
  validateLoginUser,
  validateRegisterUser,
  validateExistUser,
  validateUpdateUser,
  validateEmail,
  validateChangePassword,
  validateHeaders,
  validateHeadersSuper,
  validatetokenloginuser,
  validateActiveUser,
} /** @type {UsersValidation} */ = usersVali;

const {
  getUserId,
  getCoodinators,
  getPogrammers,
  loginUser,
  validateTokenLogin,
  registerUser,
  getUsers,
  updateUser,
  activeUser,
  inactiveUser,
  logoutUser,
  resetPassword,
  changePassword,
} /** @type {UserController} */ = userCtrl;

const routerUsers = Router();

routerUsers.get("/logout", validateHeaders, logoutUser);
routerUsers.get("/onlycoordinator", validateHeadersSuper, getCoodinators);
routerUsers.get("/onlyprogrammers", validateHeadersSuper, getPogrammers);
routerUsers.get("/:id", validateExistUser, getUserId);
routerUsers.get("/", validateHeadersSuper, getUsers);
routerUsers.post("/login", validateLoginUser, loginUser);
routerUsers.post("/token/productive/stages", validatetokenloginuser,validateTokenLogin);
routerUsers.post("/register", validateRegisterUser, registerUser);
routerUsers.post("/resetpassword", validateEmail, resetPassword);
routerUsers.put("/active/:id", validateActiveUser, activeUser);
routerUsers.put("/inactive/:id", validateExistUser, inactiveUser);
routerUsers.put("/update/:id", validateUpdateUser, updateUser);
routerUsers.put(
  "/changepassword/:token",
  validateChangePassword,
  changePassword
);

export { routerUsers };
