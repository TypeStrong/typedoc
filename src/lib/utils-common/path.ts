/**
 * Represents a normalized path with path separators being `/`
 * On Windows, drives are represented like `C:/Users` for consistency
 * with TypeScript.
 *
 * The empty string `""` is a valid normalized path.
 */
export type NormalizedPath = "" | string & { readonly __normPath: unique symbol };

/**
 * Represents either a {@link NormalizedPath} or a Node module name
 * (e.g. `typedoc-plugin-mdn-links` or `@gerrit0/typedoc-plugin`)
 */
export type NormalizedPathOrModule = NormalizedPath | string & { readonly __normPathOrModule: unique symbol };

/**
 * Represents a glob path configured by a user.
 */
export type GlobString = string & { readonly __globString: unique symbol };
