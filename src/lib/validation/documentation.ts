import * as path from "path";
import * as ts from "typescript";
import { ProjectReflection, ReflectionKind } from "../models";
import { Logger, normalizePath } from "../utils";

export function validateDocumentation(
    project: ProjectReflection,
    logger: Logger,
    requiredToBeDocumented: readonly (keyof typeof ReflectionKind)[]
): void {
    const kinds = requiredToBeDocumented.reduce(
        (prev, cur) => (prev |= ReflectionKind[cur]),
        0
    );

    for (const ref of project.getReflectionsByKind(kinds)) {
        const symbol = project.getSymbolFromReflection(ref);
        if (!ref.comment && symbol?.declarations) {
            const decl = symbol.declarations[0];
            const sourceFile = decl.getSourceFile();
            const { line } = ts.getLineAndCharacterOfPosition(
                sourceFile,
                decl.getStart()
            );
            const file = normalizePath(
                path.relative(process.cwd(), sourceFile.fileName)
            );

            if (file.startsWith(`node_modules${path.delimiter}`)) {
                continue;
            }

            logger.warn(
                `${ref.name}, defined at ${file}:${line}, does not have any documentation.`
            );
        }
    }
}
