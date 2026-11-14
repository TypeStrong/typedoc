import * as ts from "../ts.js";

let api: ts.API | undefined;

/**
 * Get the TypeScript API, which starts a compiler process the first time it is
 * used. All programs in this process share it.
 */
export function getTypeScriptApi(): ts.API {
    api ??= new ts.API({ cwd: process.cwd() });
    return api;
}

export interface CreateProgramOptions {
    rootNames: readonly string[];
    options: ts.CompilerOptions;
    projectReferences?: readonly ts.ProjectReference[] | undefined;
}

const rootNames = new WeakMap<ts.Program, readonly string[]>();

export function createProgram(options: CreateProgramOptions): ts.Program {
    const program = getTypeScriptApi().createProgram(
        options.rootNames,
        options.options,
        { projectReferences: options.projectReferences },
    );
    rootNames.set(program, options.rootNames);
    return program;
}

export function getRootFileNames(program: ts.Program): readonly string[] {
    return rootNames.get(program) ?? program.getProject().parsedCommandLine.fileNames;
}

export function getPreEmitDiagnostics(program: ts.Program): ts.Diagnostic[] {
    const diagnostics = [
        ...program.getConfigFileParsingDiagnostics(),
        ...program.getProgramDiagnostics(),
        ...program.getSyntacticDiagnostics(),
        ...program.getGlobalDiagnostics(),
        ...program.getSemanticDiagnostics(),
    ];
    const options = program.getCompilerOptions();
    if (options.declaration || options.composite) {
        diagnostics.push(...program.getDeclarationDiagnostics());
    }

    const seen = new Set<string>();
    return diagnostics.filter((diagnostic) => {
        const key = `${diagnostic.fileName}:${diagnostic.pos}:${diagnostic.code}:${diagnostic.text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
