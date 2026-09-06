/**
 * JWT Test Utilities
 *
 * Provides helpers to validate and inspect JWT tokens in test suites.
 * Designed specifically for this project's custom RS256/base64url tokens,
 * but works with any standard JWT (HS256, RS256, etc.).
 *
 * JWT Structure: <header>.<payload>.<signature>
 * Each part is base64url-encoded UTF-8 JSON (header & payload).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JwtHeader {
  alg: string;
  typ: string;
}

export interface JwtPayload {
  sub: string;
  id: string;
  role: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
  [key: string]: unknown; // allow extra claims
}

export interface ParsedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Converts a base64url-encoded string to a UTF-8 string.
 * base64url differs from base64 in two characters: `-` → `+`, `_` → `/`
 * and has no padding `=`.
 */
function base64UrlToUtf8(base64Url: string): string {
  // Normalise to standard base64
  const base64 = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");

  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Attempts to JSON.parse a value; returns null on failure.
 */
function tryParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns `true` only when the string has the three-part JWT structure
 * AND both the header and payload decode to valid UTF-8 JSON.
 *
 * This is the canonical check to use in `expect(isJwt(token)).toBe(true)`.
 */
export function isJwt(token: string | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [rawHeader, rawPayload] = parts;

  try {
    const headerJson = base64UrlToUtf8(rawHeader!);
    const payloadJson = base64UrlToUtf8(rawPayload!);

    const header = tryParseJson<JwtHeader>(headerJson);
    const payload = tryParseJson<JwtPayload>(payloadJson);

    return (
      header !== null &&
      typeof header.alg === "string" &&
      typeof header.typ === "string" &&
      payload !== null &&
      typeof payload.sub === "string" &&
      typeof payload.iat === "number" &&
      typeof payload.exp === "number"
    );
  } catch {
    return false;
  }
}

/**
 * Parses a raw JWT string into its decoded header, payload, and signature.
 * Throws a descriptive error if the token is malformed — useful for
 * debugging failed tests.
 */
export function parseJwt(token: string): ParsedJwt {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error(
      `parseJwt: expected 3 parts separated by ".", got ${parts.length}. Token: "${token}"`
    );
  }

  const [rawHeader, rawPayload, rawSignature] = parts as [string, string, string];

  const headerJson = base64UrlToUtf8(rawHeader);
  const payloadJson = base64UrlToUtf8(rawPayload);

  const header = tryParseJson<JwtHeader>(headerJson);
  const payload = tryParseJson<JwtPayload>(payloadJson);

  if (!header) {
    throw new Error(`parseJwt: header is not valid JSON after base64url decode. Raw: "${rawHeader}"`);
  }
  if (!payload) {
    throw new Error(`parseJwt: payload is not valid JSON after base64url decode. Raw: "${rawPayload}"`);
  }

  return {
    header,
    payload,
    signature: rawSignature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
    },
  };
}

/**
 * Returns `true` when the token's `exp` claim is in the future.
 * Uses UTC seconds, consistent with the JWT spec (RFC 7519 §4.1.4).
 */
export function isTokenExpired(token: string): boolean {
  const { payload } = parseJwt(token);
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp < nowSec;
}

/**
 * Extracts and decodes the payload of a JWT without verifying the signature.
 * Intentionally "insecure" — only for use inside test files.
 */
export function decodeJwtPayload(token: string): JwtPayload {
  return parseJwt(token).payload;
}
