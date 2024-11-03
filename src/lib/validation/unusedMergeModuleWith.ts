import { ReflectionKind, type ProjectReflection } from "../models/index.js";
import type { Logger } from "../utils/index.js";
export function validateMergeModuleWith(
    project: ProjectReflection,
    logger: Logger,
): void {
    for (const refl of project.getReflectionsByKind(
        ReflectionKind.SomeModule,
    )) {
        if (refl.comment?.getTag("@mergeModuleWith")) {
            logger.warn(
                logger.i18n.reflection_0_has_unused_mergeModuleWith_tag(
                    refl.getFriendlyFullName(),
                ),
            );
        }
    }

    if (project.comment?.getTag("@mergeModuleWith")) {
        logger.warn(
            logger.i18n.reflection_0_has_unused_mergeModuleWith_tag(
                "<project>",
            ),
        );
    }
}
