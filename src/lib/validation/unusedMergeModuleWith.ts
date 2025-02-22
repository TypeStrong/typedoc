import { i18n, type Logger } from "#utils";
import { type ProjectReflection, ReflectionKind } from "../models/index.js";

export function validateMergeModuleWith(
    project: ProjectReflection,
    logger: Logger,
): void {
    for (
        const refl of project.getReflectionsByKind(
            ReflectionKind.SomeModule,
        )
    ) {
        if (refl.comment?.getTag("@mergeModuleWith")) {
            logger.warn(
                i18n.reflection_0_has_unused_mergeModuleWith_tag(
                    refl.getFriendlyFullName(),
                ),
            );
        }
    }

    if (project.comment?.getTag("@mergeModuleWith")) {
        logger.warn(
            i18n.reflection_0_has_unused_mergeModuleWith_tag(
                "<project>",
            ),
        );
    }
}
