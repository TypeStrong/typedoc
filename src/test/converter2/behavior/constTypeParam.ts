export type HasNames = { names: readonly string[] };
export function getNamesExactly<const T extends HasNames>(arg: T): T["names"] {
    return arg.names;
}
