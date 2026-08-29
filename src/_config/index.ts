import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(__dirname, `../../.env${process.env.NODE_ENV}`) });
const { PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
export const Config = Object.freeze({
  PORT,
  DB_HOST,
  DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,NODE_ENV
});