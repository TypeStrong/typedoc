import { type FileId, FileRegistry } from "../models/FileRegistry.js";
import type { Deserializer, JSONOutput } from "#serialization";
import { i18n, type NormalizedPath, NormalizedPathUtils } from "#utils";
import { existsSync } from "fs";

export class ValidatingFileRegistry extends FileRegistry {
    override register(
        sourcePath: NormalizedPath,
        relativePath: NormalizedPath,
    ): { target: FileId; anchor: string | undefined } | undefined {
        const absolute = NormalizedPathUtils.resolve(NormalizedPathUtils.dirname(sourcePath), relativePath);
        const absoluteWithoutAnchor = absolute.replace(/#.*/, "");
        // Note: We allow paths to directories to be registered here, but the AssetsPlugin will not
        // copy them to the output path. This is so that we can link to directories and associate them
        // with reflections in packages mode.
        if (!existsSync(absoluteWithoutAnchor)) {
            return;
        }
        return this.registerAbsolute(absolute);
    }

    override fromObject(de: Deserializer, obj: JSONOutput.FileRegistry) {
        for (const [key, val] of Object.entries(obj.entries)) {
            const absolute = NormalizedPathUtils.resolve(de.projectRoot, val);
            if (!existsSync(absolute)) {
                de.logger.warn(
                    i18n.saved_relative_path_0_resolved_from_1_does_not_exist(
                        val,
                        de.projectRoot,
                    ),
                );
                continue;
            }

            de.oldFileIdToNewFileId[+key as FileId] = this.registerAbsolute(absolute).target;
        }

        de.defer((project) => {
            for (const [media, reflId] of Object.entries(obj.reflections)) {
                const refl = project.getReflectionById(
                    de.oldIdToNewId[reflId]!,
                );
                if (refl) {
                    this.mediaToReflection.set(
                        de.oldFileIdToNewFileId[+media as FileId]!,
                        refl.id,
                    );
                } else {
                    de.logger.warn(
                        i18n.serialized_project_referenced_0_not_part_of_project(
                            reflId.toString(),
                        ),
                    );
                }
            }
        });
    }
}
