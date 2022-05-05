/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverage: true,
  coverageDirectory: "./coverage",
  coverageReporters: ["html", "text"],
  preset: 'ts-jest',
  setupFiles: ["dotenv/config"],
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.[jt]s?(x)',]
};