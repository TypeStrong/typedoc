import { deepStrictEqual as equal } from "assert";
import { join } from "path";
import * as ts from "typescript";
import { Application, EntryPointStrategy, TSConfigReader } from "..";

let converterApp: Application | undefined;
let converterProgram: ts.Program | undefined;
let converter2App: Application | undefined;
let converter2Program: ts.Program | undefined;

export function getConverterBase() {
    return join(__dirname, "converter");
}

export function getConverterApp() {
    if (!converterApp) {
        converterApp = new Application();
        converterApp.options.addReader(new TSConfigReader());
        converterApp.bootstrap({
            logger: "none",
            name: "typedoc",
            excludeExternals: true,
            disableSources: true,
            tsconfig: join(getConverterBase(), "tsconfig.json"),
            externalPattern: ["**/node_modules/**"],
            plugin: [],
            entryPointStrategy: EntryPointStrategy.Expand,
        });
    }

    return converterApp;
}

export function getConverterProgram() {
    if (!converterProgram) {
        const app = getConverterApp();
        converterProgram = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(converterProgram);
        equal(errors, []);
    }
    return converterProgram;
}

export function getConverter2Base() {
    return join(__dirname, "converter2");
}

export function getConverter2App() {
    if (!converter2App) {
        converter2App = new Application();
        converter2App.options.addReader(new TSConfigReader());
        converter2App.bootstrap({
            excludeExternals: true,
            tsconfig: join(getConverter2Base(), "tsconfig.json"),
            plugin: [],
            validation: true,
        });
    }
    return converter2App;
}

export function getConverter2Program() {
    if (!converter2Program) {
        const app = getConverter2App();
        converter2Program = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(converter2Program);
        equal(errors, []);
    }

    return converter2Program;
}
