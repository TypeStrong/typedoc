// @ts-check
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Application, Converter, OptionDefaults } from "typedoc";
/** @import { CommentDisplayPart, FileRegistry, TranslatedString} from "typedoc" */

/** @param {Application} app */
export function load(app) {
    app.on(Application.EVENT_BOOTSTRAP_END, () => {
        app.options.setValue("inlineTags", [
            ...OptionDefaults.inlineTags,
            "@listOptions",
        ]);
    });

    app.converter.on(Converter.EVENT_CREATE_DOCUMENT, (_ctx, doc) => {
        // Known we have this as documents always have a file path
        const fileName = /** @type {string} */ (
            doc.project.files.getReflectionPath(doc)
        );

        replaceListOptions(fileName, doc.content, doc.project.files);
    });

    /**
     * @param {string} sourceFile
     * @param {CommentDisplayPart[]} parts
     * @param {FileRegistry} files
     */
    function replaceListOptions(sourceFile, parts, files) {
        for (let i = 0; i < parts.length; ++i) {
            const part = parts[i];
            if (part.kind === "inline-tag" && part.tag === "@listOptions") {
                parts.splice(
                    i,
                    1,
                    ...buildListOptions(sourceFile, part.text.trim(), files),
                );
            }
        }
    }

    /**
     * @param {string} sourceFile
     * @param {string} userPath
     * @param {FileRegistry} files
     * @returns {CommentDisplayPart[]}
     */
    function buildListOptions(sourceFile, userPath, files) {
        const file = join(dirname(sourceFile), userPath.trim());

        /** @type {string[]} */
        const headings = [];
        const content = readFileSync(file, "utf-8");
        for (const line of content.split("\n")) {
            if (line.startsWith("## ")) {
                headings.push(line.substring(3).trim());
            }
        }

        /** @type {CommentDisplayPart[]} */
        const result = [];

        for (const heading of headings) {
            result.push({ kind: "text", text: `- [${heading}](` });
            const text = userPath + "#" + heading.toLowerCase();
            const relPath = files.register(sourceFile, text);
            if (!relPath) {
                app.logger.warn(
                    /** @type {TranslatedString} */ (
                        `@listOptions specified a file "${text}" which does not exist`
                    ),
                );
                return [];
            }

            result.push({
                kind: "relative-link",
                target: relPath?.target,
                targetAnchor: relPath?.anchor,
                text,
            });
            result.push({ kind: "text", text: ")\n" });
        }

        return result;
    }
}
