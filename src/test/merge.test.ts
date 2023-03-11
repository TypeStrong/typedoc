import { deepStrictEqual as equal, ok } from "assert";
import { join } from "path";
import {
    Application,
    DeclarationReflection,
    EntryPointStrategy,
    ReferenceType,
} from "../index";
import { getConverterBase } from "./programs";
import { TestLogger } from "./TestLogger";

const base = getConverterBase();

describe("Merging projects", () => {
    it("Handles multiple projects", () => {
        const app = new Application();
        app.bootstrap({
            entryPointStrategy: EntryPointStrategy.Merge,
            entryPoints: [
                join(base, "alias/specs.json"),
                join(base, "class/specs.json"),
            ],
        });
        app.logger = new TestLogger();

        const project = app.convert();
        equal(project?.name, "typedoc");
        equal(
            project.children?.map((c) => c.name),
            ["alias", "class"]
        );

        const crossRef = project.getChildByName(
            "alias.MergedCrossReference"
        ) as DeclarationReflection;
        const testClass = project.getChildByName("class.class.TestClass");
        ok(testClass, "Missing test class");
        ok(crossRef, "Missing MergedCrossReference");
        ok(crossRef.type instanceof ReferenceType);

        ok(
            testClass === crossRef.type.reflection,
            "Cross project reference did not work"
        );
        const link = crossRef.comment?.summary[0];
        equal(link?.kind, "inline-tag" as const);
        equal(link.target, testClass, "Cross project link did not work");
    });
});
