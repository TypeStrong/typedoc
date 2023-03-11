import { ok } from "assert";
import { existsSync } from "fs";
import { join } from "path";
import type { Application } from "../lib/application";
import type { ProjectReflection } from "../lib/models";
import { behaviorTests } from "./behaviorTests";
import { issueTests } from "./issueTests";
import {
    getConverter2App,
    getConverter2Base,
    getConverter2Program,
} from "./programs";
import { TestLogger } from "./TestLogger";

const base = getConverter2Base();
const app = getConverter2App();

function runTest(
    title: string,
    pre: ((app: Application) => void) | undefined,
    entry: string,
    check: (project: ProjectReflection, logger: TestLogger) => void
) {
    it(title, () => {
        const program = getConverter2Program();

        const entryPoint = [
            join(base, `${entry}.ts`),
            join(base, `${entry}.d.ts`),
            join(base, `${entry}.tsx`),
            join(base, `${entry}.js`),
            join(base, entry, "index.ts"),
            join(base, entry, "index.js"),
        ].find(existsSync);

        ok(entryPoint, `No entry point found for ${entry}`);
        const sourceFile = program.getSourceFile(entryPoint);
        ok(sourceFile, `No source file found for ${entryPoint}`);

        const snap = app.options.snapshot();

        const logger = new TestLogger();
        app.logger = logger;
        pre?.(app);
        app.options.setValue("entryPoints", [entryPoint]);
        const project = app.converter.convert([
            {
                displayName: entry,
                program,
                sourceFile,
            },
        ]);

        app.options.restore(snap);
        check(project, logger);
    });
}

describe("Converter2", () => {
    it("Compiles", () => {
        getConverter2Program();
    });

    for (const [entry, check] of Object.entries(issueTests)) {
        if (entry.startsWith("pre")) continue;

        const link = `https://github.com/TypeStrong/typedoc/issues/${entry.replace(
            /[^\d]/g,
            ""
        )}`;

        const name = `Issue ${entry
            .replace("_skip", "")
            .substring(2)
            .padEnd(4)} (${link})`;

        if (entry.endsWith("_skip")) {
            it.skip(name);
        } else {
            runTest(
                name,
                issueTests[`pre${entry.slice(2)}` as `pre${bigint}${string}`],
                join("issues", entry),
                check as (
                    project: ProjectReflection,
                    logger: TestLogger
                ) => void
            );
        }
    }

    for (const [entry, check] of Object.entries(behaviorTests)) {
        const title = `Handles ${entry
            .replace(/([a-z][A-Z])/g, (x) => `${x[0]} ${x[1].toLowerCase()}`)
            .replace("_skip", "")}`;

        if (entry.startsWith("_")) continue;

        if (entry.endsWith("_skip")) {
            it.skip(entry);
        } else {
            runTest(
                title,
                behaviorTests[`_${entry}`],
                join("behavior", entry),
                check as (
                    project: ProjectReflection,
                    logger: TestLogger
                ) => void
            );
        }
    }
});
