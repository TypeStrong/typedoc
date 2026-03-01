import type { ProjectReflection } from "../models/index.js";
import { i18n, type Logger } from "#utils";
import { isFile } from "../utils/fs.js";

export function validateFilePaths(
    project: ProjectReflection,
    logger: Logger,
): void {
    for (const absolute of project.files.getMediaPaths()) {
        if (!isFile(absolute)) {
            logger.validationWarning(
                i18n.relative_path_0_is_not_a_file_and_will_not_be_copied_to_output(absolute),
            );
        }
    }
}
