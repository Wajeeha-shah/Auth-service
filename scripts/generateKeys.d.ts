/**
 * scripts/generateKeys.ts
 *
 * Generates an RSA-2048 key pair and writes both keys as PEM files
 * into the `certs/` directory at the project root.
 *
 * Usage:
 *   npm run generate:keys
 *
 * Output:
 *   certs/private.pem   — RS256 private key  (PKCS#8, PEM)
 *   certs/public.pem    — RS256 public key   (SPKI,   PEM)
 *
 * IMPORTANT: Never commit the certs/ folder to version control.
 *            The .gitignore already excludes it.
 */
export {};
//# sourceMappingURL=generateKeys.d.ts.map