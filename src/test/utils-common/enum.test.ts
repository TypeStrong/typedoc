import { deepStrictEqual as equal, ok } from "assert";
import { ReflectionKind } from "../../lib/models/index.js";
import { debugFlags, getEnumFlags, getEnumKeys, hasAllFlags, hasAnyFlag, removeFlag } from "#utils";

describe("Enum utils", () => {
    it("getEnumFlags", () => {
        const keys = getEnumFlags(123);
        equal(keys, [1, 2, 8, 16, 32, 64]);
    });

    it("removeFlag", () => {
        equal(removeFlag(3, 2), 1);
        equal(removeFlag(3, 1), 2);
        equal(removeFlag(3, 4), 3);
    });

    it("hasAllFlags", () => {
        equal(hasAllFlags(3, 1), true);
        equal(hasAllFlags(3, 1 | 2), true);
        equal(hasAllFlags(3, 1 | 4), false);
    });

    it("hasAnyFlag", () => {
        equal(hasAnyFlag(3, 1), true);
        equal(hasAnyFlag(3, 1 | 2), true);
        equal(hasAnyFlag(3, 1 | 4), true);
        equal(hasAnyFlag(3, 4), false);
    });

    it("debugFlags", () => {
        enum Flags {
            A = 1,
            B = 2,
            C = 4,
        }
        equal(debugFlags(Flags, Flags.A), ["A"]);
        equal(debugFlags(Flags, Flags.A | Flags.B), ["A", "B"]);
        equal(debugFlags(Flags, Flags.A | Flags.C), ["A", "C"]);
        equal(debugFlags(Flags, 0), []);
    });

    it("getEnumKeys", () => {
        const keys = getEnumKeys(ReflectionKind);
        ok(keys.includes("Project"));
        ok(!keys.includes("SignatureContainer"));
    });
});
