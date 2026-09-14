import { body } from "express-validator";

export default [
  body("name").exists().withMessage("Tenant name is required"),
  body("address").exists().withMessage("Tenant address is required"),
];
