import ModDefault, { a as b } from "./mod";
import * as Mod from "./mod";
export * from "./mod";

export { b as c, add, Mod, ModDefault };

function add(x: number, y: number) {
    return x + y;
}

/**
 * This is a comment for Mod that overwrites the one specified in "mod"
 */
export * as Mod2 from "./mod";

// Note that this will show up in the docs, not the default function from mod.
// export * from "./mod" does *not* re-export the default function.
export default function (a: number) {}

import * as x from "./test.json";

/** @hidden */
export const x2: string = x.issue;

export namespace GH1453 {
    export const Module = Mod;
    export const TypedModule: typeof import("./mod") = Mod;
    export const Member = Mod.a;
    export const TypedMember: typeof import("./mod").a = Mod.a;

    export type Foo = import("./mod").GH1453Helper;
}
