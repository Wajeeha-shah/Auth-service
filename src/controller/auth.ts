import type { Response, NextFunction, Request } from "express";
import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import type { registerUserRequest, userData } from "../types/auth.js";
import { authService } from "../services/authService.js";
import { createAuthTokens, tokenMaxAge, verifyToken } from "../services/tokenService.js";
import createHttpError from "http-errors";

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

      const rtRecord = await this.authService.createRefreshTokenRecord(user.id);

      const { accessToken, refreshToken } = createAuthTokens({
        id: user.id,
        role: user.role,
      }, rtRecord.id.toString());
      
      const secure = process.env.NODE_ENV === "prod" ? "; Secure" : "";
      res.append("Set-Cookie", `accesstoken=${accessToken}; Max-Age=${tokenMaxAge.access}; Path=/; HttpOnly; SameSite=Lax${secure}`);
      res.append("Set-Cookie", `refreshtoken=${refreshToken}; Max-Age=${tokenMaxAge.refresh}; Path=/; HttpOnly; SameSite=Lax${secure}`);

      return res.status(201).json({
        id: user.id,
        message: "User registered successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    this.logger.info("POST /auth/login hit");

    const { email, password } = matchedData(req);

    try {
      const user = await this.authService.login(email, password);
      
      const rtRecord = await this.authService.createRefreshTokenRecord(user.id);

      const { accessToken, refreshToken } = createAuthTokens({
        id: user.id,
        role: user.role,
      }, rtRecord.id.toString());
      
      const secure = process.env.NODE_ENV === "prod" ? "; Secure" : "";
      res.append("Set-Cookie", `accesstoken=${accessToken}; Max-Age=${tokenMaxAge.access}; Path=/; HttpOnly; SameSite=Lax${secure}`);
      res.append("Set-Cookie", `refreshtoken=${refreshToken}; Max-Age=${tokenMaxAge.refresh}; Path=/; HttpOnly; SameSite=Lax${secure}`);

      return res.status(200).json({
        id: user.id,
        message: "Logged in successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract cookies manually
      const cookieHeader = req.headers.cookie;
      if (!cookieHeader) {
        throw createHttpError(401, "No refresh token provided");
      }

      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, ...v] = c.split('=');
          return [key, decodeURIComponent(v.join('='))];
        })
      );

      const rawRefreshToken = cookies['refreshtoken'];
      if (!rawRefreshToken) {
        throw createHttpError(401, "No refresh token provided");
      }

      // Verify the JWT token signature and expiration
      let decoded;
      try {
        decoded = verifyToken(rawRefreshToken);
      } catch (err: any) {
        throw createHttpError(401, `Invalid refresh token: ${err.message}`);
      }

      if (decoded.type !== "refresh") {
        throw createHttpError(401, "Invalid token type");
      }

      if (!decoded.jti) {
        throw createHttpError(401, "Refresh token is missing identifier (jti)");
      }

      // Validate against the database record (also revokes the old one)
      await this.authService.validateAndRevokeRefreshToken(decoded.jti, decoded.id);

      // Create a new refresh token record for token rotation
      const newRtRecord = await this.authService.createRefreshTokenRecord(decoded.id);

      // Issue new tokens
      const { accessToken, refreshToken } = createAuthTokens({
        id: decoded.id,
        role: decoded.role,
      }, newRtRecord.id.toString());
      
      const secure = process.env.NODE_ENV === "prod" ? "; Secure" : "";
      res.append("Set-Cookie", `accesstoken=${accessToken}; Max-Age=${tokenMaxAge.access}; Path=/; HttpOnly; SameSite=Lax${secure}`);
      res.append("Set-Cookie", `refreshtoken=${refreshToken}; Max-Age=${tokenMaxAge.refresh}; Path=/; HttpOnly; SameSite=Lax${secure}`);

      return res.status(200).json({
        message: "Tokens refreshed successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
