import { ReflectionKind } from "#models";
import { getEnumKeys } from "#utils";
import { deepStrictEqual as equal } from "assert/strict";

describe("ReflectionKind", () => {
    const mismatches: Partial<Record<ReflectionKind, string>> = {
        [ReflectionKind.Enum]: "Enumeration",
        [ReflectionKind.EnumMember]: "Enumeration Member",
        [ReflectionKind.CallSignature]: "Call Signature",
        [ReflectionKind.IndexSignature]: "Index Signature",
        [ReflectionKind.ConstructorSignature]: "Constructor Signature",
        [ReflectionKind.TypeLiteral]: "Type Literal",
        [ReflectionKind.TypeParameter]: "Type Parameter",
        [ReflectionKind.GetSignature]: "Get Signature",
        [ReflectionKind.SetSignature]: "Set Signature",
        [ReflectionKind.TypeAlias]: "Type Alias",
    };

    it("Has singular translations which match the enum names", () => {
        for (const name of getEnumKeys(ReflectionKind)) {
            const kind = ReflectionKind[name as "Project"];
            equal(mismatches[kind] || name, ReflectionKind.singularString(kind));
        }
    });

    it("Has singular translations which match the pluralized enum names", () => {
        const plural = (s: string) =>
            s.endsWith("y")
                ? s.slice(0, -1) + "ies"
                : s.endsWith("s")
                ? s + "es"
                : s + "s";

        const mismatchesPlural: Partial<Record<ReflectionKind, string>> = Object.fromEntries(
            Object.entries(mismatches).map(e => [e[0], plural(e[1])]),
        );

        for (const name of getEnumKeys(ReflectionKind)) {
            const kind = ReflectionKind[name as "Project"];
            equal(mismatchesPlural[kind] || plural(name), ReflectionKind.pluralString(kind));
        }
    });
});
