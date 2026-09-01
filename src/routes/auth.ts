import express, { Request, Response, NextFunction } from "express";
import AuthController from "../controller/auth.js";
import { authService } from "../services/authService.js";
import logger from "../utils/logger.js";

const router = express.Router();
const userService: authService = new authService();
const authController = new AuthController(userService, logger);

router.post("/auth/register", (req: Request, res: Response, next: NextFunction) => {
  void authController.register(req, res, next);
});

export default router;

