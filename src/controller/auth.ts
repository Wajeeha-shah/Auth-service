import type { Response, NextFunction } from "express";
import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import type { registerUserRequest, userData } from "../types/auth.js";
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
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    this.logger.info("POST /auth/register hit");

    const { username, email, password } = matchedData(req) as userData;

    this.logger.debug("New request to register a user", {
      username,
      email,
      password: "***",
    });

    try {
      const user = await this.authService.create({
        username,
        email,
        password,
      });

      return res.status(201).json({
        id: user.id,
        message: "User registered successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;