import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],

  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  moduleNameMapper: {
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@infraestructure/(.*)$": "<rootDir>/src/infraestructure/$1",
    "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  },

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/server.ts",
    "!src/**/seed.ts",
    "!src/**/migrate.ts"
  ],

  coveragePathIgnorePatterns: ["/node_modules/"],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;