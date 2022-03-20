import { ProjectReflection, ReflectionKind } from "../models";
import type { Logger } from "../utils";

export function validateDocumentation(
    project: ProjectReflection,
    logger: Logger,
    requiredToBeDocumented: readonly (keyof typeof ReflectionKind)[]
): void {
    const kinds = requiredToBeDocumented.reduce(
        (prev, cur) => prev | ReflectionKind[cur],
        0
    );

    for (const ref of project.getReflectionsByKind(kinds)) {
        const decl = ref.sources?.[0];
        if (!ref.comment && decl) {
            const { line, fileName } = decl;

            if (fileName.includes("node_modules")) {
                continue;
            }

            const loc = `${fileName}:${line + 1}`;
            logger.warn(
                `${ref.name}, defined at ${loc}, does not have any documentation.`
            );
        }
    }
}
