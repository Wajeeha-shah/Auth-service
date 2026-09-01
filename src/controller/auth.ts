import type { Request, Response } from "express";
import { AppDataSource } from "../_config/data-source.js";
import { USER } from "../entity/user.entity.js";
import logger from "../utils/logger.js";
import type { registerUserRequest } from "../types/auth.js";
import { authService } from "../services/authService.js";

async class AuthController {
  authService:authService;
  constructor(authService:authService){
    this.authService=authService;
  }
  async register(req: registerUserRequest, res: Response) {
    logger.info("POST /auth/register hit");

    const { username, email, password } = req.body 
await this.authService.create({ username, email, password })

    return res.status(201).json({
      message: "User registered successfully",
    
    });
  }
}

export default AuthController;
