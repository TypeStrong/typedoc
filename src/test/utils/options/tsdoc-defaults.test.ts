import { deepEqual as equal } from "assert/strict";
import { join } from "path";
import ts from "typescript";
import * as defaults from "../../../lib/utils/options/tsdoc-defaults.js";
import { fileURLToPath } from "url";
import { TYPEDOC_ROOT } from "../../../lib/utils/general.js";
import { readFile } from "../../../lib/utils/fs.js";

describe("tsdoc-defaults.ts", () => {
    const tsdoc = ts.readConfigFile(
        join(fileURLToPath(import.meta.url), "../../../../../tsdoc.json"),
        ts.sys.readFile,
    );
    const tagDefinitions = tsdoc.config?.tagDefinitions as Array<{
        tagName: string;
        syntaxKind: "block" | "modifier" | "inline";
    }>;

    function tagsByKind(kind: "block" | "modifier" | "inline") {
        return tagDefinitions
            .filter((t) => t.syntaxKind === kind)
            .map((t) => t.tagName)
            .sort((a, b) => a.localeCompare(b));
    }

    before(() => {
        equal(tsdoc.error, undefined);
    });

    it("Should expose the same block tags as the tsdoc.json file", () => {
        const tsdocTags = tagsByKind("block");

        const typedocTags = defaults.blockTags
            .filter((t) => !defaults.tsdocBlockTags.includes(t as never))
            .sort((a, b) => a.localeCompare(b));

        // @inheritDoc is a special case. We can't specify it in the tsdoc.json
        // or the official parser blows up, because it thinks that it is only
        // an inline tag.
        typedocTags.splice(typedocTags.indexOf("@inheritDoc"), 1);

        equal(tsdocTags, typedocTags);
    });

    it("Should expose the same modifier tags as the tsdoc.json file", () => {
        const tsdocTags = tagsByKind("modifier");

        const typedocTags = defaults.modifierTags
            .filter((t) => !defaults.tsdocModifierTags.includes(t as never))
            .sort((a, b) => a.localeCompare(b));

        equal(tsdocTags, typedocTags);
    });

    it("Should expose the same inline tags as the tsdoc.json file", () => {
        const tsdocTags = tagsByKind("inline");

        const typedocTags = defaults.inlineTags
            .filter((t) => !defaults.tsdocInlineTags.includes(t as never))
            .sort((a, b) => a.localeCompare(b));

        equal(tsdocTags, typedocTags);
    });

    const allDocumentedTags = getDocumentedTags();

    it("Should only include block tags which are documented on the website", () => {
        const tags: string[] = [...defaults.blockTags].sort();
        const documentedTags = allDocumentedTags
            .filter((tag) => tags.includes(tag))
            .sort();
        equal(tags, documentedTags);
    });

    it("Should only include modifier tags which are documented on the website", () => {
        const tags: string[] = [...defaults.modifierTags].sort();
        const documentedTags = allDocumentedTags
            .filter((tag) => tags.includes(tag))
            .sort();
        equal(tags, documentedTags);
    });

    it("Should only include inline tags which are documented on the website", () => {
        const tags: string[] = [...defaults.inlineTags].sort();
        const documentedTags = allDocumentedTags
            .filter((tag) => tags.includes(tag))
            .sort();
        equal(tags, documentedTags);
    });
});

function getDocumentedTags() {
    const text = readFile(TYPEDOC_ROOT + "/site/tags.md");
    const tags: string[] = [];

    for (const line of text.split("\n")) {
        if (line.startsWith("-   [")) {
            tags.push(...Array.from(line.matchAll(/(@\w+)/g), (m) => m[1]));
        }
    }

    return tags;
}
