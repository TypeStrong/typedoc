import { deepStrictEqual as equal } from "assert";
import type { DeclarationOptionBase } from "../../../lib/utils/options/index.js";
import { addTypeDocOptions } from "../../../lib/utils/options/sources/typedoc.js";
import { readFile } from "../../../lib/utils/fs.js";
import { TYPEDOC_ROOT } from "../../../lib/utils/general.js";

describe("TypeDoc Options", () => {
    it("Option documentation", () => {
        const names: string[] = [];
        addTypeDocOptions({
            addDeclaration(opt: DeclarationOptionBase) {
                names.push(opt.name);
            },
        });
        names.sort();

        const documentedNames: string[] = [];
        for (const line of readFile(TYPEDOC_ROOT + "/site/options.md").split(
            "\n",
        )) {
            const match = line.match(/^\s*-\s*\[(.*?)\]\(options\//);
            if (match) {
                documentedNames.push(match[1]);
            }
        }
        documentedNames.sort();

        equal(names, documentedNames);
    });
});
