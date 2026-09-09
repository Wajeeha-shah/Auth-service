import { AppDataSource } from "../_config/data-source.js";
import type { userData } from "../types/auth.js";
import { USER } from "../entity/user.entity.js";
import { RefreshToken } from "../entity/refreshtoken.entity.js";
import { Roles } from "../constants/index.js";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";

export class authService {
  async create({ username, email, password }: userData) {
    const userRepository = AppDataSource.getRepository(USER);

    // Unique email check
    const existingUser = await userRepository.findOneBy({ email: email.trim() });
    if (existingUser) {
      throw createHttpError(400, "Email is already in use");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = userRepository.create({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    const savedUser = await userRepository.save(user);
    return savedUser;
  }

  async login(email: string, password: string) {
    const userRepository = AppDataSource.getRepository(USER);
    const user = await userRepository.findOneBy({ email: email.trim() });
    
    if (!user) {
      throw createHttpError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createHttpError(401, "Invalid credentials");
    }

    return user;
  }

  async createRefreshTokenRecord(userId: string) {
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const expiresAt = new Date(Date.now() + 7 * MS_IN_DAY); // 7 days

    const record = refreshTokenRepository.create({
      userId,
      expiresAt,
    });
    
    const savedRecord = await refreshTokenRepository.save(record);
    return savedRecord;
  }

  async validateAndRevokeRefreshToken(jti: string, userId: string) {
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    
    const recordId = parseInt(jti, 10);
    if (isNaN(recordId)) {
        throw createHttpError(401, "Invalid token identifier");
    }

    const record = await refreshTokenRepository.findOneBy({ id: recordId });

    if (!record) {
      throw createHttpError(401, "Refresh token not found");
    }

    if (record.userId !== userId) {
      throw createHttpError(401, "Refresh token does not belong to user");
    }

    if (record.revoked) {
      throw createHttpError(401, "Refresh token revoked");
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw createHttpError(401, "Refresh token expired");
    }

    // Revoke the current token
    record.revoked = true;
    await refreshTokenRepository.save(record);

    return true;
  }

  async deleteRefreshToken(id: number): Promise<void> {
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    const record = await refreshTokenRepository.findOneBy({ id });

    if (!record) {
      throw createHttpError(404, "Refresh token record not found");
    }

    await refreshTokenRepository.delete({ id });
  }
}

