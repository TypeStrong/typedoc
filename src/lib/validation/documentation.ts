import * as path from "path";
import * as ts from "typescript";
import {
    DeclarationReflection,
    ProjectReflection,
    ReflectionKind,
    SignatureReflection,
} from "../models";
import { Logger, normalizePath } from "../utils";
import { removeFlag } from "../utils/enum";

export function validateDocumentation(
    project: ProjectReflection,
    logger: Logger,
    requiredToBeDocumented: readonly (keyof typeof ReflectionKind)[]
): void {
    let kinds = requiredToBeDocumented.reduce(
        (prev, cur) => prev | ReflectionKind[cur],
        0
    );

    // Functions, Constructors, and Accessors never have comments directly on them.
    // If they are required to be documented, what's really required is that their
    // contained signatures have a comment.
    if (kinds & ReflectionKind.FunctionOrMethod) {
        kinds |= ReflectionKind.CallSignature;
        kinds = removeFlag(kinds, ReflectionKind.FunctionOrMethod);
    }
    if (kinds & ReflectionKind.Constructor) {
        kinds |= ReflectionKind.ConstructorSignature;
        kinds = removeFlag(kinds, ReflectionKind.Constructor);
    }
    if (kinds & ReflectionKind.Accessor) {
        kinds |= ReflectionKind.GetSignature | ReflectionKind.SetSignature;
        kinds = removeFlag(kinds, ReflectionKind.Accessor);
    }

    for (const ref of project.getReflectionsByKind(kinds)) {
        let symbol = project.getSymbolFromReflection(ref);
        let index = 0;

        // Signatures don't have symbols associated with them, so get the parent and then
        // maybe also adjust the declaration index that we care about.
        if (!symbol && ref.kindOf(ReflectionKind.SomeSignature)) {
            symbol = project.getSymbolFromReflection(ref.parent!);

            const parentIndex = (
                ref.parent as DeclarationReflection
            ).signatures?.indexOf(ref as SignatureReflection);
            if (parentIndex) {
                index = parentIndex;
            }
        }

        const decl = symbol?.declarations?.[index];

        if (!ref.hasComment() && decl) {
            const sourceFile = decl.getSourceFile();

            if (sourceFile.fileName.includes("node_modules")) {
                continue;
            }

            const { line } = ts.getLineAndCharacterOfPosition(
                sourceFile,
                decl.getStart()
            );
            const file = normalizePath(
                path.relative(process.cwd(), sourceFile.fileName)
            );

            const loc = `${file}:${line + 1}`;
            logger.warn(
                `${ref.getFriendlyFullName()}, defined at ${loc}, does not have any documentation.`
            );
        }
    }
}
