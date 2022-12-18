import { Project, tempdirProject } from "@typestrong/fs-fixture-builder";
import { deepStrictEqual as equal } from "assert";
import { basename } from "path";
import { glob } from "../../lib/utils/fs";

describe("fs.ts", () => {
    let fix: Project;
    beforeEach(() => {
        fix = tempdirProject();
    });

    afterEach(() => {
        fix.rm();
    });

    describe("glob", () => {
        it("handles root match", () => {
            fix.write();

            const result = glob(fix.cwd, fix.cwd, { includeDirectories: true });
            equal(result, [fix.cwd]);
        });

        it("Handles basic globbing", () => {
            fix.addFile("test.ts");
            fix.addFile("test2.ts");
            fix.addFile("a.ts");
            fix.addFile("b.js");
            fix.write();

            equal(
                glob(`${fix.cwd}/*.ts`, fix.cwd).map((f) => basename(f)),
                ["a.ts", "test.ts", "test2.ts"]
            );
            equal(
                glob(`**/test*.ts`, fix.cwd).map((f) => basename(f)),
                ["test.ts", "test2.ts"]
            );
        });
    });
});
