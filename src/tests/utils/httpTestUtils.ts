/**
 * HTTP Test Utilities
 *
 * Provides helpers to inspect HTTP responses in test suites,
 * including cookie parsing from SuperTest responses.
 */

import type { Response as SuperTestResponse } from "supertest";

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the raw value of a named cookie from a SuperTest response.
 *
 * Parses the `Set-Cookie` header array. Cookie values are URL-decoded
 * so you always get a plain UTF-8 string regardless of encoding.
 *
 * @param response  - The SuperTest response object.
 * @param name      - Case-sensitive cookie name.
 * @returns The cookie value, or `undefined` if not found.
 *
 * @example
 * const accessToken = getCookie(response, "accesstoken");
 * expect(isJwt(accessToken)).toBe(true);
 */
export function getCookie(
  response: SuperTestResponse,
  name: string
): string | undefined {
  const cookies = response.headers["set-cookie"] as string[] | undefined;
  if (!cookies) return undefined;

  const match = cookies.find((c) => c.startsWith(`${name}=`));
  if (!match) return undefined;

  // Take only the value segment (before the first attribute separator `;`)
  const rawValue = match.split(";", 1)[0]!.slice(name.length + 1);

  // URL-decode to get the plain UTF-8 string
  try {
    return decodeURIComponent(rawValue);
  } catch {
    // If decoding fails, return the raw value as-is
    return rawValue;
  }
}

/**
 * Returns all cookies from a SuperTest response as a key→value map.
 * Values are URL-decoded.
 *
 * @example
 * const cookies = getAllCookies(response);
 * expect(cookies["accesstoken"]).toBeDefined();
 */
export function getAllCookies(
  response: SuperTestResponse
): Record<string, string> {
  const setCookieHeader = response.headers["set-cookie"] as string[] | undefined;
  if (!setCookieHeader) return {};

  return Object.fromEntries(
    setCookieHeader.map((c) => {
      const [pair] = c.split(";", 1) as [string];
      const eqIndex = pair.indexOf("=");
      const key = pair.slice(0, eqIndex);
      const rawValue = pair.slice(eqIndex + 1);
      try {
        return [key, decodeURIComponent(rawValue)];
      } catch {
        return [key, rawValue];
      }
    })
  );
}

/**
 * Asserts that a cookie is `HttpOnly` by inspecting its raw header string.
 * Use this inside a `describe` block where you have the raw response.
 */
export function isCookieHttpOnly(
  response: SuperTestResponse,
  name: string
): boolean {
  const cookies = response.headers["set-cookie"] as string[] | undefined;
  if (!cookies) return false;

  const match = cookies.find((c) => c.startsWith(`${name}=`));
  if (!match) return false;

  return match.toLowerCase().includes("httponly");
}
