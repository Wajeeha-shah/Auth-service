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

import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Absolute path to the project root (one level up from /scripts) */
const PROJECT_ROOT = resolve(__dirname, "..");

/** Output directory for key files */
const CERTS_DIR = resolve(PROJECT_ROOT, "certs");

const PRIVATE_KEY_PATH = resolve(CERTS_DIR, "private.pem");
const PUBLIC_KEY_PATH = resolve(CERTS_DIR, "public.pem");

// ---------------------------------------------------------------------------
// Guard: avoid accidentally overwriting existing keys
// ---------------------------------------------------------------------------

if (existsSync(PRIVATE_KEY_PATH) || existsSync(PUBLIC_KEY_PATH)) {
  console.warn(
    "\n⚠️  Key files already exist in certs/.\n" +
      "   Delete them manually if you intentionally want to rotate keys.\n" +
      "   Exiting without changes.\n"
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Generate RSA-2048 key pair
// ---------------------------------------------------------------------------

console.log("🔑  Generating RSA-2048 key pair …");

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,

  privateKeyEncoding: {
    type: "pkcs8",   // PKCS#8 — universally supported
    format: "pem",
  },

  publicKeyEncoding: {
    type: "spki",    // SubjectPublicKeyInfo — standard for RS256
    format: "pem",
  },
});

// ---------------------------------------------------------------------------
// Write to certs/
// ---------------------------------------------------------------------------

// Create the directory if it doesn't exist yet
mkdirSync(CERTS_DIR, { recursive: true });

// Write files with restricted permissions (owner read/write only)
writeFileSync(PRIVATE_KEY_PATH, privateKey, { encoding: "utf-8", mode: 0o600 });
writeFileSync(PUBLIC_KEY_PATH,  publicKey,  { encoding: "utf-8", mode: 0o644 });

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------

console.log("✅  Keys written successfully:");
console.log(`    Private key → ${PRIVATE_KEY_PATH}`);
console.log(`    Public key  → ${PUBLIC_KEY_PATH}`);
console.log(
  "\n💡  Tip: Add PRIVATE_KEY_PATH / PUBLIC_KEY_PATH to your .env files\n" +
  "         or rely on the default certs/ path in tokenService.ts\n"
);
