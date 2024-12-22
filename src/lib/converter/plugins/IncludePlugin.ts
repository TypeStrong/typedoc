import path from "path";
import fs from "fs";

import { ConverterComponent } from "../components.js";
import { ConverterEvents } from "../converter-events.js";
import type { CommentDisplayPart, Reflection } from "../../models/index.js";
import { MinimalSourceFile } from "../../utils/minimalSourceFile.js";
import type { Converter } from "../converter.js";
import { isFile } from "../../utils/fs.js";

/**
 * Handles `@include` and `@includeCode` within comments/documents.
 */
export class IncludePlugin extends ConverterComponent {
    get logger() {
        return this.application.logger;
    }

    constructor(owner: Converter) {
        super(owner);
        const onCreate = this.onCreate.bind(this);
        owner.on(ConverterEvents.CREATE_PROJECT, onCreate);
        owner.on(ConverterEvents.CREATE_DOCUMENT, onCreate);
        owner.on(ConverterEvents.CREATE_DECLARATION, onCreate);
        owner.on(ConverterEvents.CREATE_PARAMETER, onCreate);
        owner.on(ConverterEvents.CREATE_SIGNATURE, onCreate);
        owner.on(ConverterEvents.CREATE_TYPE_PARAMETER, onCreate);
    }

    private onCreate(_context: unknown, refl: Reflection) {
        if (refl.isDocument()) {
            // We know it must be present as documents are always associated with a file.
            const relative = this.application.files.getReflectionPath(refl)!;
            this.checkIncludeTagsParts(
                refl,
                path.dirname(relative),
                refl.content,
            );
        }

        if (!refl.comment?.sourcePath) return;
        const relative = path.dirname(refl.comment.sourcePath);
        this.checkIncludeTagsParts(refl, relative, refl.comment.summary);
        for (const tag of refl.comment.blockTags) {
            this.checkIncludeTagsParts(refl, relative, tag.content);
        }
    }

    checkIncludeTagsParts(
        refl: Reflection,
        relative: string,
        parts: CommentDisplayPart[],
        included: string[] = [],
    ) {
        for (let i = 0; i < parts.length; ++i) {
            const part = parts[i];

            if (
                part.kind !== "inline-tag" ||
                !["@include", "@includeCode"].includes(part.tag)
            ) {
                continue;
            }

            const [filename, target] = part.text.trim().split("#");
            const file = path.resolve(relative, filename);
            if (included.includes(file) && part.tag === "@include") {
                this.logger.error(
                    this.logger.i18n.include_0_in_1_specified_2_circular_include_3(
                        part.tag,
                        refl.getFriendlyFullName(),
                        part.text,
                        included.join("\n\t"),
                    ),
                );
            } else if (isFile(file)) {
                const text = fs.readFileSync(file, "utf-8");
                if (part.tag === "@include") {
                    const sf = new MinimalSourceFile(text, file);
                    const { content } = this.owner.parseRawComment(
                        sf,
                        refl.project.files,
                    );
                    this.checkIncludeTagsParts(
                        refl,
                        path.dirname(file),
                        content,
                        [...included, file],
                    );
                    parts.splice(i, 1, ...content);
                } else {
                    const regionStart = `// #region ${target}`;
                    const regionEnd = `// #endregion ${target}`;
                    parts[i] = {
                        kind: "code",
                        text: makeCodeBlock(
                            path.extname(file).substring(1),
                            target
                                ? text.substring(
                                      text.indexOf(regionStart) +
                                          regionStart.length,
                                      text.indexOf(regionEnd),
                                  )
                                : text,
                        ),
                    };
                }
            } else {
                this.logger.warn(
                    this.logger.i18n.include_0_in_1_specified_2_resolved_to_3_does_not_exist(
                        part.tag,
                        refl.getFriendlyFullName(),
                        part.text,
                        file,
                    ),
                );
            }
        }
    }
}
function makeCodeBlock(lang: string, code: string) {
    const escaped = code.replace(/`(?=`)/g, "`\u200B");
    return "\n\n```" + lang + "\n" + escaped.trimEnd() + "\n```";
}
