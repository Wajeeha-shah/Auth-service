import { AppDataSource } from "../_config/data-source.js";
import type { userData } from "../controller/auth.js";
import { USER } from "../entity/user.entity.js";
import { Roles } from "../constants/index.js";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";

export class authService {
  async create({ username, email, password }: userData) {
    const userRepository = AppDataSource.getRepository(USER);

    // 1. Email presence validation
    if (!email || !email.trim()) {
      throw createHttpError(400, "Email is required");
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw createHttpError(400, "Invalid email format");
    }

    // 3. Unique email check
    const existingUser = await userRepository.findOneBy({ email: email.trim() });
    if (existingUser) {
      throw createHttpError(400, "Email is already in use");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = userRepository.create({
      username: username ?? "",
      email: email.trim(),
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    const savedUser = await userRepository.save(user);
    return savedUser;
  }
}

