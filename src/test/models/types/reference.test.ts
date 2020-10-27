import { deepStrictEqual as equal } from "assert";
import { ReflectionKind } from "../../../lib/models";
import { DeclarationReflection } from "../../../lib/models/reflections/declaration";
import { ReferenceType } from "../../../lib/models/types/reference";

describe("Reference Type", () => {
    describe("equals", () => {
        it("types with same symbolFullyQualifiedName are equal", () => {
            const type1 = new ReferenceType("Type", "Type");
            const type2 = new ReferenceType("Type", "Type");

            equal(type1.equals(type2), true);
        });

        it("types with different symbolFullyQualifiedName are not equal", () => {
            const type1 = new ReferenceType("Type1", "Type1");
            const type2 = new ReferenceType("Type2", "Type2");

            equal(type1.equals(type2), false);
        });

        it("types with different symbolFullyQualifiedName but same reflection are equal", () => {
            const reflection = new DeclarationReflection(
                "declaration",
                ReflectionKind.Function
            );
            const type1 = new ReferenceType("Type1", "Type1", reflection);
            const type2 = new ReferenceType("Type2", "Type2", reflection);

            equal(type1.equals(type2), true);
        });

        it("types with different symbolFullyQualifiedName but different reflection (one is undefined) are equal", () => {
            const reflection = new DeclarationReflection(
                "declaration",
                ReflectionKind.Function
            );
            const type1 = new ReferenceType("Type1", "Type1", reflection);
            const type2 = new ReferenceType("Type2", "Type2", undefined);

            equal(type1.equals(type2), false);
        });
    });
});
