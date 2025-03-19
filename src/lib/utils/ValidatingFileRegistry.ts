import { FileRegistry } from "../models/FileRegistry.js";
import type { FileSystem } from "./fs.js";
import type { Deserializer, JSONOutput } from "#serialization";
import { i18n, type NormalizedPath, NormalizedPathUtils } from "#utils";

export class ValidatingFileRegistry extends FileRegistry {
    constructor(private fs: FileSystem) {
        super();
    }

    override register(
        sourcePath: NormalizedPath,
        relativePath: NormalizedPath,
    ): { target: number; anchor: string | undefined } | undefined {
        const absolute = NormalizedPathUtils.resolve(NormalizedPathUtils.dirname(sourcePath), relativePath);
        const absoluteWithoutAnchor = absolute.replace(/#.*/, "");
        if (!this.fs.isFile(absoluteWithoutAnchor)) {
            return;
        }
        return this.registerAbsolute(absolute);
    }

    override fromObject(de: Deserializer, obj: JSONOutput.FileRegistry) {
        for (const [key, val] of Object.entries(obj.entries)) {
            const absolute = NormalizedPathUtils.resolve(de.projectRoot, val);
            if (!this.fs.isFile(absolute)) {
                de.logger.warn(
                    i18n.saved_relative_path_0_resolved_from_1_is_not_a_file(
                        val,
                        de.projectRoot,
                    ),
                );
                continue;
            }

            de.oldFileIdToNewFileId[+key] = this.registerAbsolute(absolute).target;
        }

        de.defer((project) => {
            for (const [media, reflId] of Object.entries(obj.reflections)) {
                const refl = project.getReflectionById(
                    de.oldIdToNewId[reflId]!,
                );
                if (refl) {
                    this.mediaToReflection.set(
                        de.oldFileIdToNewFileId[+media]!,
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
