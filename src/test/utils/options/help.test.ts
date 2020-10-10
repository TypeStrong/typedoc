import { ok } from "assert";

import {
    Options,
    Logger,
    ParameterType,
    ParameterHint,
} from "../../../lib/utils";
import { getOptionsHelp } from "../../../lib/utils/options/help";

describe("Options - help", () => {
    const options = new Options(new Logger());
    options.addDeclarations([
        { name: "td-option", help: "help", type: ParameterType.String },
        { name: "td-option2", help: "help" },
        { name: "not displayed", help: "" },
        {
            name: "td",
            help: "help",
            hint: ParameterHint.File,
        },
    ]);

    it("Describes TypeDoc options", () => {
        const help = getOptionsHelp(options);
        ok(help.includes("td-option"));
    });

    it("Does not list options without help", () => {
        const help = getOptionsHelp(options);
        ok(!help.includes("not displayed"));
    });
});
