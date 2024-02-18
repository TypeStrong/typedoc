import { ok } from "assert";

import { Options, ParameterType, ParameterHint } from "../../../lib/utils";
import { getOptionsHelp } from "../../../lib/utils/options/help";
import { Internationalization } from "../../../lib/internationalization/internationalization";

describe("Options - help", () => {
    const i18n = new Internationalization(null).proxy;
    const options = new Options(new Internationalization(null).proxy);
    for (const decl of [
        { name: "td-option", help: "help", type: ParameterType.String },
        { name: "td-option2", help: "help" },
        { name: "not displayed", help: "" },
        {
            name: "td",
            help: "help",
            hint: ParameterHint.File,
        },
    ]) {
        options.addDeclaration(decl as never);
    }

    it("Describes TypeDoc options", () => {
        const help = getOptionsHelp(options, i18n);
        ok(help.includes("td-option"));
    });

    it("Does not list options without help", () => {
        const help = getOptionsHelp(options, i18n);
        ok(!help.includes("not displayed"));
    });
});
