export class CustomExportedError extends Error {}

/**
 * @throws {TypeError} When the input is invalid.
 * @throws {CustomExportedError} When the operation fails.
 * @throws {MissingError} When an unresolvable error occurs.
 */
export function throwsExample(): void {}
