import { deepEqual as equal } from "assert/strict";
import { join } from "path";
import ts from "typescript";
import * as defaults from "../../../lib/utils/options/tsdoc-defaults";

describe("tsdoc-defaults.ts", () => {
    const tsdoc = ts.readConfigFile(
        join(__dirname, "../../../../tsdoc.json"),
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
});
