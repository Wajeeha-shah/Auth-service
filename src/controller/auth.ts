import type { Request, Response } from "express";
import { AppDataSource } from "../_config/data-source.js";
import { USER } from "../entity/user.entity.js";
import logger from "../utils/logger.js";

class AuthController {
  async register(req: Request, res: Response) {
    logger.info("POST /auth/register hit");

    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    const userRepository = AppDataSource.getRepository(USER);
    const user = userRepository.create({
      username: username ?? "",
      email: email ?? "",
      password: password ?? "",
    });

    const savedUser = await userRepository.save(user);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  }
}

export default AuthController;
