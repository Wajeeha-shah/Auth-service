import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeEnv = process.env.NODE_ENV ?? "dev";

config({ path: path.join(__dirname, `../../.env.${nodeEnv}`) });
const {
  PORT,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
  JWKS_URI,
} = process.env;
export const Config = Object.freeze({
  PORT,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
  JWKS_URI,
  NODE_ENV: nodeEnv,
});
