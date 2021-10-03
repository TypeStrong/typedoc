/** A simple numeric constant. */
export const PI = 3.14159265359;

/** A simple string constant. */
export const STRING_CONSTANT = "FOOBAR";

/** An plain JavaScript object using `as const`. */
export const ObjectConstant = {
    library: "typedoc",
    version: "1.2.3",

    /** How many people starred us on GitHub. */
    githubStars: 1_000_000,
} as const;

/**
 * An exported variable defined with `let`.
 *
 * This pattern should generally be avoided because the variable can be reassigned.
 */
// eslint-disable-next-line prefer-const
export let E = 2.718281828459045235;
