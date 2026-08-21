import {config} from 'dotenv';
config();
const PORT = process.env.PORT;
export const Config= Object.freeze({
  PORT,
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret'
});