import * as Path from "path";

import isEqual = require("lodash/isEqual");
import Assert = require("assert");

import { createMinimatch } from "../../lib/utils/paths";

// Used to ensure uniform path cross OS
const absolutePath = (path: string) =>
    Path.resolve(path.replace(/^\w:/, "")).replace(/[\\]/g, "/");

describe("Paths", () => {
    describe("createMinimatch", () => {
        it("Minimatch can match absolute paths expressions", () => {
            const paths = [
                "/unix/absolute/**/path",
                "\\windows\\alternative\\absolute\\path",
                "\\Windows\\absolute\\*\\path",
                "**/arbitrary/path/**",
            ];
            const mms = createMinimatch(paths);
            const patterns = mms.map(({ pattern }) => pattern);
            const comparePaths = [
                absolutePath("/unix/absolute/**/path"),
                absolutePath("/windows/alternative/absolute/path"),
                absolutePath("/Windows/absolute/*/path"),
                "**/arbitrary/path/**",
            ];

            Assert(isEqual(patterns, comparePaths));

            Assert(
                mms[0].match(absolutePath("/unix/absolute/some/sub/dir/path"))
            );
            Assert(
                mms[1].match(absolutePath("/windows/alternative/absolute/path"))
            );
            Assert(mms[2].match(absolutePath("/Windows/absolute/test/path")));
            Assert(
                mms[3].match(
                    absolutePath("/some/deep/arbitrary/path/leading/nowhere")
                )
            );
        });

        it("Minimatch can match relative to the project root", () => {
            const paths = [
                "./relative/**/path",
                "../parent/*/path",
                "no/dot/relative/**/path/*",
                "*/subdir/**/path/*",
            ];
            const absPaths = paths.map((path) => absolutePath(path));
            const mms = createMinimatch(paths);
            const patterns = mms.map(({ pattern }) => pattern);

            Assert(isEqual(patterns, absPaths));
            Assert(mms[0].match(Path.resolve("relative/some/sub/dir/path")));
            Assert(mms[1].match(Path.resolve("../parent/dir/path")));
            Assert(
                mms[2].match(
                    Path.resolve("no/dot/relative/some/sub/dir/path/test")
                )
            );
            Assert(mms[3].match(Path.resolve("some/subdir/path/here")));
        });

        it("Minimatch matches dot files", () => {
            const mm = createMinimatch(["/some/path/**"])[0];
            Assert(mm.match(absolutePath("/some/path/.dot/dir")));
            Assert(mm.match(absolutePath("/some/path/normal/dir")));
        });

        it("Minimatch matches negated expressions", () => {
            const paths = ["!./some/path", "!!./some/path"];
            const mms = createMinimatch(paths);

            Assert(
                !mms[0].match(Path.resolve("some/path")),
                "Matched a negated expression"
            );
            Assert(
                mms[1].match(Path.resolve("some/path")),
                "Didn't match a doubly negated expression"
            );
        });

        it("Minimatch does not match commented expressions", () => {
            const [mm] = createMinimatch(["#/some/path"]);

            Assert(!mm.match("#/some/path"), "Matched a commented expression");
        });
    });
});
