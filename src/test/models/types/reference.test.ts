import type * as ts from "typescript";
import { deepStrictEqual as equal } from "assert";
import { ProjectReflection, ReflectionKind } from "../../../lib/models";
import { DeclarationReflection } from "../../../lib/models/reflections/declaration";
import { ReferenceType } from "../../../lib/models/types/reference";

describe("Reference Type", () => {
    describe("equals", () => {
        const fakeSymbol1 = (Symbol() as any) as ts.Symbol;
        const fakeSymbol2 = (Symbol() as any) as ts.Symbol;
        const project = new ProjectReflection("");

        const reflection = new DeclarationReflection(
            "declaration",
            ReflectionKind.Function
        );
        project.children ??= [];
        project.children.push(reflection);
        project.registerReflection(reflection, fakeSymbol1);

        it("types with same target are equal", () => {
            const type1 = new ReferenceType("Type", fakeSymbol1, project);
            const type2 = new ReferenceType("Type", fakeSymbol1, project);

            equal(type1.equals(type2), true);
        });

        it("unresolved types with same target are equal", () => {
            const type1 = new ReferenceType("Type", fakeSymbol2, project);
            const type2 = new ReferenceType("Type", fakeSymbol2, project);

            equal(type1.equals(type2), true);
        });

        it("types with different targets are not equal", () => {
            const type1 = new ReferenceType("Type1", fakeSymbol1, project);
            const type2 = new ReferenceType("Type2", fakeSymbol2, project);

            equal(type1.equals(type2), false);
        });

        it("types with same resolved target are equal", () => {
            const type1 = new ReferenceType("Type1", reflection, project);
            const type2 = new ReferenceType("Type2", fakeSymbol1, project);

            equal(type1.equals(type2), true);
        });
    });
});
