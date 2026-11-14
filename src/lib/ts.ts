/**
 * The TypeScript 7 API, which is split into an AST package and an API client
 * that talks to the compiler process. TypeDoc imports TypeScript through this
 * module only.
 * @module
 */
export { version, versionMajorMinor } from "typescript";
export * from "typescript/ast";
export * from "typescript/sync";
