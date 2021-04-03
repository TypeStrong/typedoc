import { join } from "path";
import { existsSync } from "fs";
import { Application, TSConfigReader } from "..";
import * as ts from "typescript";
import { deepStrictEqual as equal, ok } from "assert";
import {
    DeclarationReflection,
    ProjectReflection,
    ReflectionKind,
} from "../lib/models";

function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

const issueTests: Record<string, (project: ProjectReflection) => void> = {
    gh869(project) {
        const classFoo = project.children?.find(
            (r) => r.name === "Foo" && r.kind === ReflectionKind.Class
        );
        ok(classFoo instanceof DeclarationReflection);
        equal(
            classFoo.children?.find((r) => r.name === "x"),
            undefined
        );

        const nsFoo = project.children?.find(
            (r) => r.name === "Foo" && r.kind === ReflectionKind.Namespace
        );
        ok(nsFoo instanceof DeclarationReflection);
        ok(nsFoo.children?.find((r) => r.name === "x"));
    },

    gh1124(project) {
        equal(
            project.children?.length,
            1,
            "Namespace with type and value converted twice"
        );
    },

    gh1150(project) {
        const refl = query(project, "IntersectFirst");
        equal(refl?.kind, ReflectionKind.TypeAlias);
        equal(refl.type?.type, "indexedAccess");
    },

    gh1164(project) {
        const refl = query(project, "gh1164");
        equal(
            refl.signatures?.[0]?.parameters?.[0]?.comment?.text,
            "{@link CommentedClass} Test description."
        );
        equal(refl.signatures?.[0]?.comment?.returns, "Test description.\n");
    },

    gh1330(project) {
        const example = query(project, "ExampleParam");
        equal(example?.type?.type, "reference");
        equal(example.type.toString(), "Example");
    },

    gh1366(project) {
        const foo = query(project, "GH1366.Foo");
        equal(foo.kind, ReflectionKind.Reference);
    },

    gh1408(project) {
        const foo = query(project, "foo");
        const type = foo?.signatures?.[0]?.typeParameters?.[0].type;
        equal(type?.type, "array");
        equal(type?.toString(), "unknown[]");
    },

    gh1436(project) {
        equal(
            project.children?.map((c) => c.name),
            ["gh1436"]
        );
    },

    gh1449(project) {
        const refl = query(project, "gh1449").signatures?.[0];
        equal(
            refl?.typeParameters?.[0].type?.toString(),
            "[foo: any, bar?: any]"
        );
    },

    gh1454(project) {
        const foo = query(project, "foo");
        const fooRet = foo?.signatures?.[0]?.type;
        equal(fooRet?.type, "reference");
        equal(fooRet?.toString(), "Foo");

        const bar = query(project, "bar");
        const barRet = bar?.signatures?.[0]?.type;
        equal(barRet?.type, "reference");
        equal(barRet?.toString(), "Bar");
    },

    gh1462(project) {
        const prop = query(project, "PROP");
        equal(prop.type?.toString(), "number");

        // Would be nice to get this to work someday
        equal(prop.comment?.shortText, void 0);

        const method = query(project, "METHOD");
        equal(method.signatures?.[0].comment?.shortText, "method docs");
    },

    gh1481(project) {
        const signature = query(project, "GH1481.static").signatures?.[0];
        equal(signature?.comment?.shortText, "static docs");
        equal(signature?.type?.toString(), "void");
    },

    gh1483(project) {
        equal(
            query(project, "gh1483.namespaceExport").kind,
            ReflectionKind.Function
        );
        equal(
            query(project, "gh1483_2.staticMethod").kind,
            ReflectionKind.Method
        );
    },

    gh1490(project) {
        const refl = query(project, "GH1490.optionalMethod");
        equal(refl.signatures?.[0]?.comment?.shortText, "With comment");
    },

    gh1509(project) {
        const pFoo = query(project, "PartialFoo.foo");
        equal(pFoo.flags.isOptional, true);

        const rFoo = query(project, "ReadonlyFoo.foo");
        equal(rFoo.flags.isReadonly, true);
        equal(rFoo.flags.isOptional, true);
    },

    gh1514(project) {
        // Not ideal. Really we want to handle these names nicer...
        query(project, "ComputedUniqueName.[UNIQUE_SYMBOL]");
    },

    gh1522(project) {
        equal(
            project.groups?.map((g) => g.categories?.map((c) => c.title)),
            [["cat"]]
        );
    },

    gh1524(project) {
        const nullableParam = query(project, "nullable").signatures?.[0]
            ?.parameters?.[0];
        equal(nullableParam?.type?.toString(), "string | null");

        const nonNullableParam = query(project, "nonNullable").signatures?.[0]
            ?.parameters?.[0];
        equal(nonNullableParam?.type?.toString(), "string");
    },

    gh1534(project) {
        const func = query(project, "gh1534");
        equal(
            func.signatures?.[0]?.parameters?.[0]?.type?.toString(),
            "readonly [number, string]"
        );
    },

    gh1547(project) {
        equal(
            project.children?.map((c) => c.name),
            ["Test", "ThingA", "ThingB"]
        );
    },

    gh1552(project) {
        equal(query(project, "emptyArr").defaultValue, "[]");
        equal(query(project, "nonEmptyArr").defaultValue, "...");
        equal(query(project, "emptyObj").defaultValue, "{}");
        equal(query(project, "nonEmptyObj").defaultValue, "...");
    },
};

describe("Converter2", () => {
    const base = join(__dirname, "converter2");
    const app = new Application();
    app.options.addReader(new TSConfigReader());
    app.bootstrap({
        name: "typedoc",
        excludeExternals: true,
        disableSources: true,
        tsconfig: join(base, "tsconfig.json"),
    });

    let program: ts.Program;
    it("Compiles", () => {
        program = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(program);
        equal(errors, []);
    });

    for (const [entry, check] of Object.entries(issueTests)) {
        const link = `https://github.com/TypeStrong/typedoc/issues/${entry.substr(
            2
        )}`;

        it(`Issue ${entry.substr(2).padEnd(4)} (${link})`, () => {
            const entryPoint = [
                join(base, "issues", `${entry}.ts`),
                join(base, "issues", `${entry}.d.ts`),
                join(base, "issues", `${entry}.tsx`),
                join(base, "issues", `${entry}.js`),
                join(base, "issues", entry),
            ].find(existsSync);

            ok(entryPoint, `No entry point found for ${entry}`);

            const project = app.converter.convert([entryPoint], program);
            check(project);
        });
    }
});
