import { join } from "path";
import { existsSync } from "fs";
import { Application, TSConfigReader } from "..";
import * as ts from "typescript";
import { deepStrictEqual as equal, ok } from "assert";
import { issueTests } from "./issueTests";
import { behaviorTests } from "./behaviorTests";
import type { ProjectReflection } from "../lib/models";

const base = join(__dirname, "converter2");

const app = new Application();
app.options.addReader(new TSConfigReader());
app.bootstrap({
    name: "typedoc",
    excludeExternals: true,
    tsconfig: join(base, "tsconfig.json"),
    plugin: [],
});
app.options.freeze();

let program: ts.Program;

function runTest(
    title: string,
    entry: string,
    check: (project: ProjectReflection) => void
) {
    it(title, () => {
        const entryPoint = [
            join(base, `${entry}.ts`),
            join(base, `${entry}.d.ts`),
            join(base, `${entry}.tsx`),
            join(base, `${entry}.js`),
            join(base, entry, "index.ts"),
        ].find(existsSync);

        ok(entryPoint, `No entry point found for ${entry}`);
        const sourceFile = program.getSourceFile(entryPoint);
        ok(sourceFile, `No source file found for ${entryPoint}`);

        const project = app.converter.convert([
            {
                displayName: entry,
                program,
                sourceFile,
            },
        ]);
        check(project);
    });
}

describe("Converter2", () => {
    before("Compiles", () => {
        program = ts.createProgram(app.options.getFileNames(), {
            ...app.options.getCompilerOptions(),
            noEmit: true,
        });

        const errors = ts.getPreEmitDiagnostics(program);
        app.logger.diagnostics(errors);
        equal(errors.length, 0);
    });

    for (const [entry, check] of Object.entries(issueTests)) {
        const link = `https://github.com/TypeStrong/typedoc/issues/${entry.substr(
            2
        )}`;

        runTest(
            `Issue ${entry.substr(2).padEnd(4)} (${link})`,
            join("issues", entry),
            check
        );
    }

    for (const [entry, check] of Object.entries(behaviorTests)) {
        const title = `Handles ${entry.replace(
            /([a-z][A-Z])/g,
            (x) => `${x[0]} ${x[1].toLowerCase()}`
        )}`;

        runTest(title, join("behavior", entry), check);
    }
});
