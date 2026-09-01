import type { Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import type { registerUserRequest } from "../types/auth.js";
import { authService } from "../services/authService.js";

class AuthController {
  private authService: authService;
  private logger: typeof logger;

  constructor(authService: authService, logger: typeof logger) {
    this.authService = authService;
    this.logger = logger;
  }

  async register(
    req: registerUserRequest,
    res: Response,
    next: NextFunction
  ) {
    this.logger.info("POST /auth/register hit");

    const { username, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      username,
      email,
      password: "***",
    });

    try {
      await this.authService.create({
        username,
        email,
        password,
      });

      return res.status(201).json({
        message: "User registered successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;