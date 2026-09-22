import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset();

/** @type {import("jest").Config} */
export default {
  ...presetConfig,
  testEnvironment: "node",
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/tests/**",
    "!src/migration/**",
    "!src/subscriber/**",
    "!**/node_modules/**"
  ]
};