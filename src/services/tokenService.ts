/**
 * tokenService.ts
 *
 * Creates and manages RS256 JWT tokens (access + refresh).
 *
 * Keys are read at startup from the certs/ directory.
 * Generate them once with:  npm run generate:keys
 */

import { createSign, createVerify } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TokenType = "access" | "refresh";

export interface TokenUser {
  id: string;
  role: string;
}

interface TokenPayload extends TokenUser {
  sub: string;
  type: TokenType;
  iat: number;
  exp: number;
  jti?: string;
}

// ---------------------------------------------------------------------------
// Load key pair from certs/ at module initialisation
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Resolves to  <project-root>/certs/ regardless of where Node is invoked from */
const CERTS_DIR = resolve(__dirname, "..", "..", "certs");

/**
 * Reads a PEM file as a UTF-8 string.
 * Throws a descriptive error at startup if the file is missing so
 * you catch key issues immediately rather than at first token-sign.
 */
function readPem(filename: string): string {
  const filePath = resolve(CERTS_DIR, filename);
  try {
    return readFileSync(filePath, { encoding: "utf-8" });
  } catch (err) {
    throw new Error(
      `[tokenService] Cannot read key file "${filePath}".\n` +
        `  Run "npm run generate:keys" to generate RSA keys first.\n` +
        `  Original error: ${(err as NodeJS.ErrnoException).message}`
    );
  }
}

const privateKey: string = readPem("private.pem");
const publicKey:  string = readPem("public.pem");

// ---------------------------------------------------------------------------
// Token durations (seconds)
// ---------------------------------------------------------------------------

const durations: Record<TokenType, number> = {
  access:  15 * 60,            // 15 minutes
  refresh: 7 * 24 * 60 * 60,  // 7 days
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Encodes a plain JS object as a base64url UTF-8 JSON string. */
function encode(value: object): string {
  return Buffer.from(JSON.stringify(value), "utf-8").toString("base64url");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a signed RS256 JWT for the given user and token type.
 */
/**
 * Creates a signed RS256 JWT for the given user and token type.
 *
 * @param overrideExpiresInSeconds - Optional. When provided, overrides the
 *   default duration. Pass a negative value (e.g. -1) to create an already-
 *   expired token — useful in tests without real time travel.
 *   ⚠️  Never use this parameter outside of test code.
 */
export function createToken(
  user: TokenUser,
  type: TokenType,
  jti?: string,
  overrideExpiresInSeconds?: number
): string {
  const now = Math.floor(Date.now() / 1000);

  const header = encode({ alg: "RS256", typ: "JWT" });

  const expiresIn = overrideExpiresInSeconds !== undefined
    ? overrideExpiresInSeconds
    : durations[type];

  const payload: TokenPayload = {
    sub:  user.id,
    id:   user.id,
    role: user.role,
    type,
    iat:  now,
    exp:  now + expiresIn,
  };

  if (jti) {
    payload.jti = jti;
  }

  const encodedPayload = encode(payload);
  const signingInput   = `${header}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput, "utf-8");
  signer.end();

  const signature = signer.sign(privateKey, "base64url");

  return `${signingInput}.${signature}`;
}

/**
 * Convenience wrapper — creates both access and refresh tokens in one call.
 */
export function createAuthTokens(user: TokenUser, refreshJti?: string) {
  return {
    accessToken:  createToken(user, "access"),
    refreshToken: createToken(user, "refresh", refreshJti),
  };
}

/**
 * Verifies a JWT token signature and expiration.
 */
export function verifyToken(token: string): TokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;

  const verifier = createVerify("RSA-SHA256");
  verifier.update(signingInput, "utf-8");
  verifier.end();

  const isValid = verifier.verify(publicKey, signature, "base64url");
  if (!isValid) {
    throw new Error("Invalid token signature");
  }

  const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  
  const now = Math.floor(Date.now() / 1000);
  if (decodedPayload.exp && decodedPayload.exp < now) {
    throw new Error("Token expired");
  }

  return decodedPayload as TokenPayload;
}

/** The raw private key PEM — exported for test utilities that need to verify tokens. */
export { privateKey, publicKey };

export const tokenMaxAge = durations;
