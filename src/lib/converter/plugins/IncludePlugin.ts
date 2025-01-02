import path from "path";
import fs from "fs";

import { ConverterComponent } from "../components.js";
import { ConverterEvents } from "../converter-events.js";
import type { CommentDisplayPart, Reflection } from "../../models/index.js";
import { MinimalSourceFile } from "../../utils/minimalSourceFile.js";
import type { Converter } from "../converter.js";
import { isFile } from "../../utils/fs.js";
import regionTagREsByExt from "../utils/regionTagREsByExt.js";

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

            const [filename, target, requestedLines] = parseIncludeCodeTextPart(
                part.text,
            );

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
                    const ext = path.extname(file).substring(1);
                    parts[i] = {
                        kind: "code",
                        text: makeCodeBlock(
                            ext,
                            target
                                ? this.getRegion(
                                      refl,
                                      file,
                                      ext,
                                      part.text,
                                      text,
                                      target,
                                  )
                                : requestedLines
                                  ? this.getLines(
                                        refl,
                                        file,
                                        part.text,
                                        text,
                                        requestedLines,
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

    getRegion(
        refl: Reflection,
        file: string,
        ext: string,
        textPart: string,
        text: string,
        target: string,
    ) {
        const regionTagsList = regionTagREsByExt[ext];
        let found: string | false = false;
        for (const [startTag, endTag] of regionTagsList) {
            const start = text.match(startTag(target));
            const end = text.match(endTag(target));

            const foundStart = start && start.length > 0;
            const foundEnd = end && end.length > 0;
            if (foundStart && !foundEnd) {
                this.logger.error(
                    this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_region_3_region_close_not_found(
                        refl.getFriendlyFullName(),
                        textPart,
                        file,
                        target,
                    ),
                );
                return "";
            }
            if (!foundStart && foundEnd) {
                this.logger.error(
                    this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_region_3_region_open_not_found(
                        refl.getFriendlyFullName(),
                        textPart,
                        file,
                        target,
                    ),
                );
                return "";
            }
            if (foundStart && foundEnd) {
                if (start.length > 1) {
                    this.logger.error(
                        this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_region_3_region_open_found_multiple_times(
                            refl.getFriendlyFullName(),
                            textPart,
                            file,
                            target,
                        ),
                    );
                    return "";
                }
                if (end.length > 1) {
                    this.logger.error(
                        this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_region_3_region_close_found_multiple_times(
                            refl.getFriendlyFullName(),
                            textPart,
                            file,
                            target,
                        ),
                    );
                    return "";
                }
                if (found) {
                    this.logger.error(
                        this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_region_3_region_found_multiple_times(
                            refl.getFriendlyFullName(),
                            textPart,
                            file,
                            target,
                        ),
                    );
                    return "";
                }
                found = text.substring(
                    text.indexOf(start[0]) + start[0].length,
                    text.indexOf(end[0]),
                );
            }
        }
        if (!found) {
            this.logger.error(
                this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_region_3_region_not_found(
                    refl.getFriendlyFullName(),
                    textPart,
                    file,
                    target,
                ),
            );
            return "";
        }
        return found;
    }

    getLines(
        refl: Reflection,
        file: string,
        textPart: string,
        text: string,
        requestedLines: string,
    ) {
        let output = "";
        const lines = text.split(/\r\n|\r|\n/);
        requestedLines.split(",").forEach((requestedLineString) => {
            if (requestedLineString.includes("-")) {
                const [start, end] = requestedLineString.split("-").map(Number);
                if (start > end) {
                    this.logger.error(
                        this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_lines_3_invalid_range(
                            refl.getFriendlyFullName(),
                            textPart,
                            file,
                            requestedLines,
                        ),
                    );
                    return "";
                }
                if (start > lines.length || end > lines.length) {
                    this.logger.error(
                        this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_lines_3_but_only_4_lines(
                            refl.getFriendlyFullName(),
                            textPart,
                            file,
                            requestedLines,
                            lines.length.toString(),
                        ),
                    );
                    return "";
                }
                output += lines.slice(start - 1, end).join("\n") + "\n";
            } else {
                const requestedLine = Number(requestedLineString);
                if (requestedLine > lines.length) {
                    this.logger.error(
                        this.logger.i18n.includeCode_tag_in_0_specified_1_file_2_lines_3_but_only_4_lines(
                            refl.getFriendlyFullName(),
                            textPart,
                            file,
                            requestedLines,
                            lines.length.toString(),
                        ),
                    );
                    return "";
                }
                output += lines[requestedLine - 1] + "\n";
            }
        });

        return output;
    }
}
function makeCodeBlock(lang: string, code: string) {
    const escaped = code.replace(/`(?=`)/g, "`\u200B");
    return "\n\n```" + lang + "\n" + escaped.trimEnd() + "\n```";
}

function parseIncludeCodeTextPart(
    text: string,
): [string, string | undefined, string | undefined] {
    let filename = text.trim();
    let target;
    let requestedLines;
    if (filename.includes("#")) {
        const parsed = filename.split("#");
        filename = parsed[0];
        target = parsed[1];
    } else if (filename.includes(":")) {
        const parsed = filename.split(":");
        filename = parsed[0];
        requestedLines = parsed[1];
    }
    return [filename, target, requestedLines];
}
