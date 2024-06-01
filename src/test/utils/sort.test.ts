import { deepStrictEqual as equal } from "assert";
import {
    DeclarationReflection,
    DocumentReflection,
    LiteralType,
    ProjectReflection,
    ReflectionFlag,
    ReflectionKind,
    ReflectionSymbolId,
} from "../../lib/models";
import { resetReflectionID } from "../../lib/models/reflections/abstract";
import { Options } from "../../lib/utils";
import { getSortFunction, type SortStrategy } from "../../lib/utils/sort";
import { Internationalization } from "../../lib/internationalization/internationalization";
import { FileRegistry } from "../../lib/models/FileRegistry";

describe("Sort", () => {
    function sortReflections(
        arr: Array<DeclarationReflection | DocumentReflection>,
        strategies: SortStrategy[],
    ) {
        const opts = new Options(new Internationalization(null).proxy);
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
            ["a", "b", "c"],
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
            ["c", "b", "a"],
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
            ["a", "c", "b"],
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
            ["a", "b", "c"],
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
            ["c", "b", "a"],
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
            ["a", "c", "b"],
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
            ["b", "a", "c"],
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
            ["c", "d", "a", "b"],
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
            ["b", "a"],
        );
    });

    it("Should sort by kind", () => {
        const arr = [
            new DeclarationReflection("1", ReflectionKind.Reference),
            new DeclarationReflection("23", ReflectionKind.SetSignature),
            new DeclarationReflection("3", ReflectionKind.Module),
            new DeclarationReflection("4", ReflectionKind.Namespace),
            new DeclarationReflection("5", ReflectionKind.Enum),
            new DeclarationReflection("6", ReflectionKind.EnumMember),
            new DeclarationReflection("15", ReflectionKind.Method),
            new DeclarationReflection("8", ReflectionKind.Interface),
            new DeclarationReflection("9", ReflectionKind.TypeAlias),
            new DeclarationReflection("10", ReflectionKind.Constructor),
            new DeclarationReflection("2", ReflectionKind.Project),
            new DeclarationReflection("22", ReflectionKind.GetSignature),
            new DeclarationReflection("12", ReflectionKind.Variable),
            new DeclarationReflection("13", ReflectionKind.Function),
            new DeclarationReflection("14", ReflectionKind.Accessor),
            new DeclarationReflection("11", ReflectionKind.Property),
            new DeclarationReflection("18", ReflectionKind.TypeLiteral),
            new DeclarationReflection("16", ReflectionKind.Parameter),
            new DeclarationReflection("17", ReflectionKind.TypeParameter),
            new DeclarationReflection("19", ReflectionKind.CallSignature),
            new DeclarationReflection("7", ReflectionKind.Class),
            new DeclarationReflection(
                "20",
                ReflectionKind.ConstructorSignature,
            ),
            new DeclarationReflection("21", ReflectionKind.IndexSignature),
        ];

        sortReflections(arr, ["kind"]);
        equal(
            arr.map((r) => r.name),
            Array.from({ length: arr.length }, (_, i) => (i + 1).toString()),
        );
    });

    it("Should sort by external last", () => {
        const arr = [
            new DeclarationReflection("a", ReflectionKind.Function),
            new DeclarationReflection("b", ReflectionKind.Function),
            new DeclarationReflection("c", ReflectionKind.Function),
        ];
        arr[0].setFlag(ReflectionFlag.External, true);
        arr[1].setFlag(ReflectionFlag.External, false);
        arr[2].setFlag(ReflectionFlag.External, true);

        sortReflections(arr, ["external-last"]);
        equal(
            arr.map((r) => r.name),
            ["b", "a", "c"],
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
            [1, 3, 0, 2],
        );
    });

    it("source-order should do nothing if no symbols are available", () => {
        const proj = new ProjectReflection("", new FileRegistry());
        const arr = [
            new DeclarationReflection("b", ReflectionKind.Function, proj),
            new DeclarationReflection("a", ReflectionKind.Function, proj),
        ];

        sortReflections(arr, ["source-order", "alphabetical"]);
        equal(
            arr.map((r) => r.name),
            ["a", "b"],
        );
    });

    it("source-order should sort by file, then by position in file", () => {
        const aId = new ReflectionSymbolId({
            sourceFileName: "a.ts",
            qualifiedName: "a",
        });
        aId.pos = 1;
        const bId = new ReflectionSymbolId({
            sourceFileName: "a.ts",
            qualifiedName: "b",
        });
        bId.pos = 2;
        const cId = new ReflectionSymbolId({
            sourceFileName: "b.ts",
            qualifiedName: "c",
        });
        cId.pos = 0;

        const proj = new ProjectReflection("", new FileRegistry());
        const a = new DeclarationReflection("a", ReflectionKind.Variable, proj);
        proj.registerSymbolId(a, aId);

        const b = new DeclarationReflection("b", ReflectionKind.Variable, proj);
        proj.registerSymbolId(b, bId);

        const c = new DeclarationReflection("c", ReflectionKind.Variable, proj);
        proj.registerSymbolId(c, cId);

        const arr = [c, b, a];

        sortReflections(arr, ["source-order"]);
        equal(
            arr.map((r) => r.name),
            ["a", "b", "c"],
        );
    });

    it("enum-member-source-order should do nothing if not an enum member", () => {
        const bId = new ReflectionSymbolId({
            sourceFileName: "a.ts",
            qualifiedName: "b",
        });
        bId.pos = 2;
        const cId = new ReflectionSymbolId({
            sourceFileName: "a.ts",
            qualifiedName: "c",
        });
        cId.pos = 1;

        const proj = new ProjectReflection("", new FileRegistry());
        const a = new DeclarationReflection("a", ReflectionKind.Variable, proj);

        const b = new DeclarationReflection(
            "b",
            ReflectionKind.EnumMember,
            proj,
        );
        proj.registerSymbolId(b, bId);

        const c = new DeclarationReflection(
            "c",
            ReflectionKind.EnumMember,
            proj,
        );
        proj.registerSymbolId(c, cId);

        const d = new DeclarationReflection("d", ReflectionKind.Variable, proj);

        const arr = [d, c, b, a];
        sortReflections(arr, ["enum-member-source-order", "alphabetical"]);
        equal(
            arr.map((r) => r.name),
            ["a", "c", "b", "d"],
        );
    });

    it("Should handle documents-first ordering", () => {
        const proj = new ProjectReflection("", new FileRegistry());
        const a = new DocumentReflection("a", proj, [], {});
        const b = new DocumentReflection("b", proj, [], {});
        const c = new DeclarationReflection("c", ReflectionKind.Class, proj);

        const arr = [a, b, c];
        sortReflections(arr, ["documents-first", "alphabetical"]);
        equal(
            arr.map((r) => r.name),
            ["a", "b", "c"],
        );

        const arr2 = [c, b, a];
        sortReflections(arr2, ["documents-first", "alphabetical"]);
        equal(
            arr2.map((r) => r.name),
            ["a", "b", "c"],
        );
    });

    it("Should handle documents-last ordering", () => {
        const proj = new ProjectReflection("", new FileRegistry());
        const a = new DocumentReflection("a", proj, [], {});
        const b = new DocumentReflection("b", proj, [], {});
        const c = new DeclarationReflection("c", ReflectionKind.Class, proj);

        const arr = [a, b, c];
        sortReflections(arr, ["documents-last", "alphabetical"]);
        equal(
            arr.map((r) => r.name),
            ["c", "a", "b"],
        );

        const arr2 = [a, c, b];
        sortReflections(arr2, ["documents-last", "alphabetical"]);
        equal(
            arr2.map((r) => r.name),
            ["c", "a", "b"],
        );
    });
});
