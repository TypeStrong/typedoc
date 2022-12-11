import { deepStrictEqual as equal } from "assert";
import {
    DeclarationReflection,
    LiteralType,
    ProjectReflection,
    ReflectionFlag,
    ReflectionKind,
} from "../../lib/models";
import { resetReflectionID } from "../../lib/models/reflections/abstract";
import { Logger, Options } from "../../lib/utils";
import { getSortFunction, SortStrategy } from "../../lib/utils/sort";

describe("Sort", () => {
    function sortReflections(
        arr: DeclarationReflection[],
        strategies: SortStrategy[]
    ) {
        const opts = new Options(new Logger());
        opts.addDefaultDeclarations();
        opts.setValue("sort", strategies);
        getSortFunction(opts)(arr);
    }

    it("Should sort by name", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.TypeAlias),
            new DeclarationReflection("c", ReflectionKind.TypeAlias),
            new DeclarationReflection("b", ReflectionKind.TypeAlias),
        ];

        sortReflections(arr, ["alphabetical"]);
        equal(
            arr.map((r) => r.name),
            ["a", "b", "c"]
        );
    });

    it("Should sort by enum value ascending", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.EnumMember),
            new DeclarationReflection("b", ReflectionKind.EnumMember),
            new DeclarationReflection("c", ReflectionKind.EnumMember),
        ];
        arr[0].type = new LiteralType(123);
        arr[1].type = new LiteralType(12);
        arr[2].type = new LiteralType(3);

        sortReflections(arr, ["enum-value-ascending"]);
        equal(
            arr.map((r) => r.name),
            ["c", "b", "a"]
        );
    });

    it("Should not sort enum value ascending if not an enum member", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.EnumMember),
            new DeclarationReflection("c", ReflectionKind.EnumMember),
        ];
        arr[0].type = new LiteralType(123);
        arr[1].type = new LiteralType(12);
        arr[2].type = new LiteralType(3);

        sortReflections(arr, ["enum-value-ascending"]);
        equal(
            arr.map((r) => r.name),
            ["a", "c", "b"]
        );
    });

    it("Should sort by enum value descending", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.EnumMember),
            new DeclarationReflection("b", ReflectionKind.EnumMember),
            new DeclarationReflection("c", ReflectionKind.EnumMember),
        ];
        arr[0].type = new LiteralType(123);
        arr[1].type = new LiteralType(12);
        arr[2].type = new LiteralType(3);

        sortReflections(arr, ["enum-value-descending"]);
        equal(
            arr.map((r) => r.name),
            ["a", "b", "c"]
        );
    });

    it("Should not sort enum value descending if not an enum member", () => {
        const arr = [
            new DeclarationReflection("c", ReflectionKind.Function),
            new DeclarationReflection("a", ReflectionKind.EnumMember),
            new DeclarationReflection("b", ReflectionKind.EnumMember),
        ];
        arr[0].type = new LiteralType(123);
        arr[1].type = new LiteralType(-1);
        arr[2].type = new LiteralType(3);

        sortReflections(arr, ["enum-value-descending"]);
        equal(
            arr.map((r) => r.name),
            ["c", "b", "a"]
        );
    });

    it("Should sort by static first", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.Function),
            new DeclarationReflection("c", ReflectionKind.Function),
        ];
        arr[0].setFlag(ReflectionFlag.Static, true);
        arr[1].setFlag(ReflectionFlag.Static, false);
        arr[2].setFlag(ReflectionFlag.Static, true);

        sortReflections(arr, ["static-first"]);
        equal(
            arr.map((r) => r.name),
            ["a", "c", "b"]
        );
    });

    it("Should sort by instance first", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.Function),
            new DeclarationReflection("c", ReflectionKind.Function),
        ];
        arr[0].setFlag(ReflectionFlag.Static, true);
        arr[1].setFlag(ReflectionFlag.Static, false);
        arr[2].setFlag(ReflectionFlag.Static, true);

        sortReflections(arr, ["instance-first"]);
        equal(
            arr.map((r) => r.name),
            ["b", "a", "c"]
        );
    });

    it("Should sort by visibility", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.Function),
            new DeclarationReflection("c", ReflectionKind.Function),
            new DeclarationReflection("d", ReflectionKind.Function),
        ];
        arr[0].setFlag(ReflectionFlag.Protected, true);
        arr[1].setFlag(ReflectionFlag.Private, true);
        arr[2].setFlag(ReflectionFlag.Public, true);
        // This might not be set. If not set, assumed public.
        // arr[3].setFlag(ReflectionFlag.Public, true);

        sortReflections(arr, ["visibility"]);
        equal(
            arr.map((r) => r.name),
            ["c", "d", "a", "b"]
        );
    });

    it("Should sort by required/optional", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Property),
            new DeclarationReflection("b", ReflectionKind.Property),
        ];
        arr[0].setFlag(ReflectionFlag.Optional, true);
        arr[1].setFlag(ReflectionFlag.Optional, false);

        sortReflections(arr, ["required-first"]);
        equal(
            arr.map((r) => r.name),
            ["b", "a"]
        );
    });

    it("Should sort by kind", () => {
        const arr = [
            new DeclarationReflection("1", ReflectionKind.Reference),
            new DeclarationReflection("24", ReflectionKind.SetSignature),
            new DeclarationReflection("3", ReflectionKind.Module),
            new DeclarationReflection("4", ReflectionKind.Namespace),
            new DeclarationReflection("5", ReflectionKind.Enum),
            new DeclarationReflection("6", ReflectionKind.EnumMember),
            new DeclarationReflection("15", ReflectionKind.Method),
            new DeclarationReflection("8", ReflectionKind.Interface),
            new DeclarationReflection("9", ReflectionKind.TypeAlias),
            new DeclarationReflection("10", ReflectionKind.Constructor),
            new DeclarationReflection("2", ReflectionKind.Project),
            new DeclarationReflection("23", ReflectionKind.GetSignature),
            new DeclarationReflection("12", ReflectionKind.Variable),
            new DeclarationReflection("13", ReflectionKind.Function),
            new DeclarationReflection("14", ReflectionKind.Accessor),
            new DeclarationReflection("11", ReflectionKind.Property),
            new DeclarationReflection("19", ReflectionKind.TypeLiteral),
            new DeclarationReflection("16", ReflectionKind.ObjectLiteral),
            new DeclarationReflection("17", ReflectionKind.Parameter),
            new DeclarationReflection("18", ReflectionKind.TypeParameter),
            new DeclarationReflection("20", ReflectionKind.CallSignature),
            new DeclarationReflection("7", ReflectionKind.Class),
            new DeclarationReflection(
                "21",
                ReflectionKind.ConstructorSignature
            ),
            new DeclarationReflection("22", ReflectionKind.IndexSignature),
        ];

        sortReflections(arr, ["kind"]);
        equal(
            arr.map((r) => r.name),
            Array.from({ length: arr.length }, (_, i) => (i + 1).toString())
        );
    });

    it("Should sort with multiple strategies", () => {
        resetReflectionID();
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.Function),
        ];
        arr[0].setFlag(ReflectionFlag.Optional, true);
        arr[2].setFlag(ReflectionFlag.Optional, true);

        sortReflections(arr, ["required-first", "alphabetical"]);
        equal(
            arr.map((r) => r.id),
            [1, 3, 0, 2]
        );
    });

    it("source-order should do nothing if no symbols are available", () => {
        const proj = new ProjectReflection("");
        const arr = [
            new DeclarationReflection("b", ReflectionKind.Function, proj),
            new DeclarationReflection("a", ReflectionKind.Function, proj),
        ];

        sortReflections(arr, ["source-order", "alphabetical"]);
        equal(
            arr.map((r) => r.name),
            ["a", "b"]
        );
    });
});
