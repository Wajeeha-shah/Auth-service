/**
 * authenticate.ts — JWT Authentication Middleware
 *
 * Verifies the `accesstoken` HTTP-only cookie using express-jwt and jwks-rsa.
 * In production:  fetches public key from Auth-service's /.well-known/jwks.json
 * In tests:       mock-jwks intercepts the same URL via nock
 */

import type { Request, Response, NextFunction } from "express";
import { expressjwt } from "express-jwt";
import type { GetVerificationKey } from "express-jwt";
import jwksClient from "jwks-rsa";
import createHttpError from "http-errors";
import { Config } from "../_config/index.js";
import { AppDataSource } from "../_config/data-source.js";
import { USER } from "../entity/user.entity.js";

if (!Config.JWKS_URI) {
  throw new Error("[authenticate] JWKS_URI is not set in environment variables.");
}

// ---------------------------------------------------------------------------
// Type augmentation
// ---------------------------------------------------------------------------

export interface AuthenticatedRequest extends Request {
  auth?: {
    sub: string;
    id: string;
    role: string;
    type: string;
  };
}

// ---------------------------------------------------------------------------
// 1. JWT Signature & Expiry Verification (express-jwt + jwks-rsa)
// ---------------------------------------------------------------------------

const verifyJwt = expressjwt({
  secret: jwksClient.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${Config.JWKS_URI}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  
  // Extract token from the HTTP-only cookie instead of the Authorization header
  getToken: (req: Request) => {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=");
        return [key, decodeURIComponent(v.join("="))];
      })
    );
    return cookies["accesstoken"];
  },
});

// ---------------------------------------------------------------------------
// 2. Database & Business Logic Validation
// ---------------------------------------------------------------------------

const validateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.auth) {
      throw createHttpError(401, "Not authenticated");
    }

    if (req.auth.type !== "access") {
      throw createHttpError(401, "Invalid token type: expected access token");
    }

    const userId = req.auth.sub;
    if (!userId) {
      throw createHttpError(401, "Token is missing subject (sub) claim");
    }

    const userRepository = AppDataSource.getRepository(USER);
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      throw createHttpError(401, "User belonging to this token no longer exists");
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Export combined middleware
// ---------------------------------------------------------------------------

export const authenticate = [verifyJwt, validateUser];
