export type HasNames = { names: readonly string[] };
export function getNamesExactly<const T extends HasNames>(arg: T): T["names"] {
    //                       ^^^^^
    return arg.names;
}

// Inferred type: readonly ["Alice", "Bob", "Eve"]
// Note: Didn't need to write 'as const' here
export const names = getNamesExactly({ names: ["Alice", "Bob", "Eve"] });
