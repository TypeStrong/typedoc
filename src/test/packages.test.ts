import { deepStrictEqual as equal, ok } from "assert";
import * as Path from "path";
import { Application } from "../lib/application";

// TODO: These tests don't really need to go through the whole process. They could
// instead just test the package expansion feature. Making this change should cut down on test time by ~50%.
describe("Packages support", () => {
    it("handles monorepos", () => {
        const base = Path.join(__dirname, "packages", "multi-package");
        const app = new Application();
        app.bootstrap({
            packages: [base],
        });
        const project = app.convert();
        equal(
            project?.children?.map((r) => r.name),
            [
                "typedoc-multi-package-bar",
                "typedoc-multi-package-baz",
                "typedoc-multi-package-foo",
            ]
        );
    });

    it("handles single packages", () => {
        const base = Path.join(__dirname, "packages", "single-package");
        const app = new Application();
        app.bootstrap({
            packages: [base],
        });
        const project = app.convert();
        ok(project, "Failed to convert project");
        equal(
            project.children?.map((r) => r.name),
            ["helloWorld"]
        );
    });
});
