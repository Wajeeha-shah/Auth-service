import { body } from "express-validator";
import { Roles } from "../constants/index.js";

const validRoles = Object.values(Roles);

export default [
  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Username cannot be empty")
    .escape(),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("role")
    .optional()
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(", ")}`),
];
