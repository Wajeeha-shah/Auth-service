import express from "express";
import type { Request, Response, NextFunction } from "express";
import AuthController from "../controller/auth.js";
import { authService } from "../services/authService.js";
import logger from "../utils/logger.js";
import registerValidator from "../validators/register-validator.js";
import loginValidator from "../validators/login-validator.js";

const router = express.Router();
const userService: authService = new authService();
const authController = new AuthController(userService, logger);

router.post(
  "/auth/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) => {
    void authController.register(req, res, next);
  }
);

router.post(
  "/auth/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) => {
    void authController.login(req, res, next);
  }
);

router.post(
  "/auth/refresh",
  (req: Request, res: Response, next: NextFunction) => {
    void authController.refresh(req, res, next);
  }
);

export default router;
