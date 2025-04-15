import path from "path";

import { ConverterComponent } from "../components.js";
import { ConverterEvents } from "../converter-events.js";
import type { CommentDisplayPart, Reflection } from "../../models/index.js";
import { MinimalSourceFile } from "#utils";
import type { Converter } from "../converter.js";
import { isFile, readFile } from "../../utils/fs.js";
import { dedent, escapeRegExp, i18n } from "#utils";
import { normalizePath } from "#node-utils";

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

            const { filename, regionTarget, requestedLines } = parseIncludeCodeTextPart(part.text);

            const file = normalizePath(path.resolve(relative, filename));
            this.application.watchFile(file);
            if (included.includes(file) && part.tag === "@include") {
                this.logger.error(
                    i18n.include_0_in_1_specified_2_circular_include_3(
                        part.tag,
                        refl.getFriendlyFullName(),
                        part.text,
                        included.join("\n\t"),
                    ),
                );
            } else if (isFile(file)) {
                const text = readFile(file).replaceAll("\r\n", "\n");
                const ext = path.extname(file).substring(1);

                const includedText = regionTarget
                    ? this.getRegions(
                        refl,
                        file,
                        ext,
                        part.text,
                        text,
                        regionTarget,
                        part.tag,
                        part.tag === "@includeCode",
                    )
                    : requestedLines
                    ? this.getLines(
                        refl,
                        file,
                        part.text,
                        text,
                        requestedLines,
                        part.tag,
                    )
                    : text;

                if (part.tag === "@include") {
                    const sf = new MinimalSourceFile(includedText, file);
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
                    parts[i] = {
                        kind: "code",
                        text: makeCodeBlock(ext, includedText),
                    };
                }
            } else {
                this.logger.error(
                    i18n.include_0_in_1_specified_2_resolved_to_3_does_not_exist(
                        part.tag,
                        refl.getFriendlyFullName(),
                        part.text,
                        file,
                    ),
                );
            }
        }
    }

    getRegions(
        refl: Reflection,
        file: string,
        ext: string,
        textPart: string,
        text: string,
        regionTargets: string,
        tag: string,
        ignoreIndent: boolean,
    ) {
        const regionTagsList = regionTagREsByExt[ext];
        if (!regionTagsList) {
            this.logger.error(
                i18n.include_0_tag_in_1_region_2_region_not_supported(
                    tag,
                    refl.getFriendlyFullName(),
                    textPart,
                ),
            );
            return "";
        }

        const targets = regionTargets.split(",").map((s) => s.trim());
        let content = "";

        for (const target of targets) {
            let found: string | false = false;
            for (const [startTag, endTag] of regionTagsList) {
                const safeTarget = escapeRegExp(target);
                const start = text.match(startTag(safeTarget));
                const end = text.match(endTag(safeTarget));

                const foundStart = start && start.length > 0;
                const foundEnd = end && end.length > 0;
                if (foundStart && !foundEnd) {
                    this.logger.error(
                        i18n.include_0_tag_in_1_specified_2_file_3_region_4_region_close_not_found(
                            tag,
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
                        i18n.include_0_tag_in_1_specified_2_file_3_region_4_region_open_not_found(
                            tag,
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
                            i18n
                                .include_0_tag_in_1_specified_2_file_3_region_4_region_open_found_multiple_times(
                                    tag,
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
                            i18n
                                .include_0_tag_in_1_specified_2_file_3_region_4_region_close_found_multiple_times(
                                    tag,
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
                            i18n.include_0_tag_in_1_specified_2_file_3_region_4_region_found_multiple_times(
                                tag,
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
            if (found === false) {
                this.logger.error(
                    i18n.include_0_tag_in_1_specified_2_file_3_region_4_region_not_found(
                        tag,
                        refl.getFriendlyFullName(),
                        textPart,
                        file,
                        target,
                    ),
                );
                return "";
            }
            if (found.trim() === "") {
                this.logger.warn(
                    i18n.include_0_tag_in_1_specified_2_file_3_region_4_region_empty(
                        tag,
                        refl.getFriendlyFullName(),
                        textPart,
                        file,
                        target,
                    ),
                );
            }

            content += ignoreIndent ? dedent(found) + "\n" : found;
        }

        return content;
    }

    getLines(
        refl: Reflection,
        file: string,
        textPart: string,
        text: string,
        requestedLines: string,
        tag: string,
    ) {
        let output = "";
        const lines = text.split(/\r\n|\r|\n/);
        requestedLines.split(",").forEach((requestedLineString) => {
            if (requestedLineString.includes("-")) {
                const [start, end] = requestedLineString.split("-").map(Number);
                if (start > end) {
                    this.logger.error(
                        i18n.include_0_tag_in_1_specified_2_file_3_lines_4_invalid_range(
                            tag,
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
                        i18n.include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines(
                            tag,
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
                        i18n.include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines(
                            tag,
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

function parseIncludeCodeTextPart(text: string): {
    filename: string;
    regionTarget: string | undefined;
    requestedLines: string | undefined;
} {
    let filename = text.trim();
    let regionTarget: string | undefined;
    let requestedLines: string | undefined;
    if (filename.includes("#")) {
        const parsed = filename.split("#");
        filename = parsed[0];
        regionTarget = parsed[1];
    } else if (filename.includes(":")) {
        const parsed = filename.split(":");
        filename = parsed[0];
        requestedLines = parsed[1];
    }
    return { filename, regionTarget, requestedLines };
}

type RegionTagRETuple = [
    (regionName: string) => RegExp,
    (regionName: string) => RegExp,
];
const regionTagREsByExt: Record<string, RegionTagRETuple[]> = {
    bat: [
        [
            (regionName) => new RegExp(`:: *#region  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`:: *#endregion  *${regionName} *\n`, "g"),
        ],
        [
            (regionName) => new RegExp(`REM  *#region  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`REM  *#endregion  *${regionName} *\n`, "g"),
        ],
    ],
    cs: [
        [
            (regionName) => new RegExp(`#region  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`#endregion  *${regionName} *\n`, "g"),
        ],
    ],
    c: [
        [
            (regionName) => new RegExp(`#pragma  *region  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`#pragma  *endregion  *${regionName} *\n`, "g"),
        ],
    ],
    css: [
        [
            (regionName) => new RegExp(`/\\* *#region *\\*/  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`/\\* *#endregion *\\*/  *${regionName} *\n`, "g"),
        ],
    ],
    md: [
        [
            (regionName) => new RegExp(`<!--  *#region  *${regionName} *--> *\n`, "g"),
            (regionName) => new RegExp(`<!--  *#endregion  *${regionName} *--> *\n`, "g"),
        ],
    ],
    ts: [
        [
            (regionName) => new RegExp(`// *#region  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`// *#endregion  *${regionName} *\n`, "g"),
        ],
    ],
    vb: [
        [
            (regionName) => new RegExp(`#Region  *${regionName} *\n`, "g"),
            (regionName) => new RegExp(`#End Region  *${regionName} *\n`, "g"),
        ],
    ],
};
regionTagREsByExt["fs"] = [
    ...regionTagREsByExt["ts"],
    [
        (regionName) => new RegExp(`(#_region)  *${regionName} *\n`, "g"),
        (regionName) => new RegExp(`(#_endregion)  *${regionName} *\n`, "g"),
    ],
];
regionTagREsByExt["java"] = [
    ...regionTagREsByExt["ts"],
    [
        (regionName) => new RegExp(`// *<editor-fold>  *${regionName} *\n`, "g"),
        (regionName) => new RegExp(`// *</editor-fold>  *${regionName} *\n`, "g"),
    ],
];
regionTagREsByExt["cpp"] = regionTagREsByExt["c"];
regionTagREsByExt["less"] = regionTagREsByExt["css"];
regionTagREsByExt["scss"] = regionTagREsByExt["css"];
regionTagREsByExt["coffee"] = regionTagREsByExt["cs"];
regionTagREsByExt["php"] = regionTagREsByExt["cs"];
regionTagREsByExt["ps1"] = regionTagREsByExt["cs"];
regionTagREsByExt["py"] = regionTagREsByExt["cs"];
regionTagREsByExt["js"] = regionTagREsByExt["ts"];
regionTagREsByExt["mts"] = regionTagREsByExt["ts"];
regionTagREsByExt["cts"] = regionTagREsByExt["ts"];
