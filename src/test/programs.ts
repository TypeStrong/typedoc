import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import ts from "typescript";
import {
    type Application,
    EntryPointStrategy,
    type JSONOutput,
    ProjectReflection,
    SourceReference,
    TSConfigReader,
} from "../index.js";
import type { ModelToObject } from "../lib/serialization/schema.js";
import { createAppForTesting } from "../lib/application.js";
import { existsSync } from "fs";
import { clearCommentCache } from "../lib/converter/comments/index.js";

let converterApp: Application | undefined;
let converterProgram: ts.Program | undefined;
let converter2App: Application | undefined;
let converter2Program: ts.Program | undefined;

export function getConverterBase() {
    return join(process.cwd(), "src/test/converter");
}

export function getConverterApp() {
    if (!converterApp) {
        converterApp = createAppForTesting();
        for (
            const [name, value] of Object.entries({
                name: "typedoc",
                excludeExternals: true,
                disableSources: false,
                excludePrivate: false,
                tsconfig: join(getConverterBase(), "tsconfig.json"),
                externalPattern: ["**/node_modules/**"],
                plugin: [],
                entryPointStrategy: EntryPointStrategy.Expand,
                gitRevision: "fake",
                readme: "none",
            })
        ) {
            converterApp.options.setValue(name as never, value as never);
        }
        new TSConfigReader().read(
            converterApp.options,
            converterApp.logger,
            process.cwd(),
        );

        converterApp.serializer.addSerializer({
            priority: -1,
            supports(obj) {
                return obj instanceof SourceReference;
            },
            toObject(
                ref: SourceReference,
                obj: ModelToObject<SourceReference>,
                _serializer,
            ) {
                if (obj.url) {
                    obj.url = `typedoc://${
                        obj.url.substring(
                            obj.url.indexOf(ref.fileName),
                        )
                    }`;
                }
                return obj;
            },
        });
        converterApp.serializer.addSerializer({
            priority: -1,
            supports(obj) {
                return obj instanceof ProjectReflection;
            },
            toObject(
                _refl: ProjectReflection,
                obj: JSONOutput.ProjectReflection,
            ) {
                delete obj.packageVersion;
                return obj;
            },
        });
    }

    return converterApp;
}

export function getConverterProgram() {
    if (!converterProgram) {
        const app = getConverterApp();
        converterProgram = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions(),
        );

        const errors = ts.getPreEmitDiagnostics(converterProgram);
        equal(errors, []);
    }
    return converterProgram;
}

export function getConverter2Base() {
    return join(process.cwd(), "src/test/converter2");
}

export function getConverter2App() {
    if (!converter2App) {
        converter2App = createAppForTesting();
        for (
            const [name, value] of Object.entries({
                excludeExternals: true,
                tsconfig: join(getConverter2Base(), "tsconfig.json"),
                validation: true,
            })
        ) {
            converter2App.options.setValue(name as never, value as never);
        }
        new TSConfigReader().read(
            converter2App.options,
            converter2App.logger,
            process.cwd(),
        );
    }
    return converter2App;
}

export function getConverter2Program() {
    if (!converter2Program) {
        const app = getConverter2App();
        converter2Program = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions(),
        );

        const errors = ts.getPreEmitDiagnostics(converter2Program);
        app.logger.diagnostics(errors);
        equal(errors.length, 0);
    }

    return converter2Program;
}

export function getConverter2Project(entries: string[], folder: string) {
    const app = getConverter2App();
    const base = getConverter2Base();
    const program = getConverter2Program();

    const entryPoints = entries
        .map((entry) =>
            [
                join(base, `${folder}/${entry}.ts`),
                join(base, `${folder}/${entry}.d.ts`),
                join(base, `${folder}/${entry}.tsx`),
                join(base, `${folder}/${entry}.js`),
                join(base, folder, entry, "index.ts"),
                join(base, folder, entry, "index.js"),
                join(base, folder, entry),
            ].find(existsSync)
        )
        .filter((x) => x !== undefined);

    const files = entryPoints.map((e) => program.getSourceFile(e));
    for (const [index, file] of files.entries()) {
        ok(file, `No source file found for ${entryPoints[index]}`);
    }

    ok(entryPoints.length > 0, "Expected at least one entry point");

    app.options.setValue("entryPoints", entryPoints);
    clearCommentCache();
    return app.converter.convert(
        files.map((file, index) => {
            return {
                displayName: entries[index].replace(/\.[tj]sx?$/, ""),
                program,
                sourceFile: file!,
            };
        }),
    );
}
