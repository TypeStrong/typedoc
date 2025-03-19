import * as FS from "fs";
import { createServer } from "net";
import { type Project, tempdirProject } from "@typestrong/fs-fixture-builder";
import { type AssertionError, deepStrictEqual as equal } from "assert";
import { basename, dirname, join, normalize, resolve } from "path";
import { createGlobString, glob, inferPackageEntryPointPaths, NodeFileSystem, normalizePath } from "#node-utils";
import type { NormalizedPath } from "#utils";

const fs = new NodeFileSystem();

describe("fs.ts", () => {
    describe("glob", () => {
        let fix: Project;
        let cwd: NormalizedPath;
        beforeEach(() => {
            fix = tempdirProject();
            cwd = normalizePath(fix.cwd);
        });
        afterEach(() => {
            fix.rm();
        });

        it("handles root match", () => {
            fix.write();

            const result = glob(createGlobString("", cwd), cwd, fs, {
                includeDirectories: true,
            });
            equal(result.map(normalize), [fix.cwd].map(normalize));
        });

        it("Handles basic globbing", () => {
            fix.addFile("test.ts");
            fix.addFile("test2.ts");
            fix.addFile("a.ts");
            fix.addFile("b.js");
            fix.write();

            equal(
                glob(createGlobString(cwd, `*.ts`), cwd, fs).map((f) => basename(f)),
                ["a.ts", "test.ts", "test2.ts"],
            );
            equal(
                glob(createGlobString(cwd, `**/test*.ts`), cwd, fs).map((f) => basename(f)),
                ["test.ts", "test2.ts"],
            );
        });

        describe("when 'followSymlinks' option is true", () => {
            it("should navigate symlinked directories", () => {
                const target = dirname(fix.dir("a").addFile("test.ts").path);
                fix.write();
                FS.symlinkSync(target, resolve(fix.cwd, "b"), "junction");
                equal(
                    glob(createGlobString(cwd, `b/*.ts`), cwd, fs, {
                        followSymlinks: true,
                    }).map((f) => basename(f)),
                    ["test.ts"],
                );
            });

            it("should navigate recursive symlinked directories only once", () => {
                fix.addFile("test.ts");
                fix.write();
                FS.symlinkSync(
                    fix.cwd,
                    resolve(fix.cwd, "recursive"),
                    "junction",
                );
                equal(
                    glob(createGlobString(cwd, `**/*.ts`), cwd, fs, {
                        followSymlinks: true,
                    }).map((f) => basename(f)),
                    ["test.ts", "test.ts"],
                );
            });

            it("should handle symlinked files", function () {
                const { path } = fix.addFile("test.ts");
                fix.write();
                try {
                    FS.symlinkSync(
                        path,
                        resolve(dirname(path), "test-2.ts"),
                        "file",
                    );
                } catch (err) {
                    // on windows, you need elevated permissions to create a file symlink.
                    // maybe we have them! maybe we don't!
                    if (
                        (err as NodeJS.ErrnoException).code === "EPERM" &&
                        process.platform === "win32"
                    ) {
                        return this.skip();
                    }
                }
                equal(
                    glob(createGlobString(cwd, `**/*.ts`), cwd, fs, {
                        followSymlinks: true,
                    }).map((f) => basename(f)),
                    ["test-2.ts", "test.ts"],
                );
            });
        });

        describe("when node_modules is present in the pattern", function () {
            it("should traverse node_modules", function () {
                fix.dir("node_modules").addFile("test.ts");
                fix.write();
                equal(
                    glob(createGlobString(cwd, `node_modules/test.ts`), cwd, fs).map((f) => basename(f)),
                    ["test.ts"],
                );
            });
        });

        describe("when node_modules is not present in the pattern", function () {
            it("should not traverse node_modules", function () {
                fix.dir("node_modules").addFile("test.ts");
                fix.write();
                equal(
                    glob(createGlobString(cwd, `**/test.ts`), cwd, fs).map((f) => basename(f)),
                    [],
                );
            });
        });

        it("should ignore anything that is not a file, symbolic link, or directory", function (done) {
            // Use unix socket for example, because that's easiest to create.
            // Skip on Windows because it doesn't support unix sockets
            if (process.platform === "win32") {
                return this.skip();
            }
            fix.write();

            const sockServer = createServer()
                .unref()
                .listen(resolve(fix.cwd, "socket.sock"))
                .once("listening", () => {
                    let err: AssertionError | null = null;
                    try {
                        equal(glob(createGlobString(cwd, `*.sock`), cwd, fs), []);
                    } catch (e) {
                        err = e as AssertionError;
                    } finally {
                        sockServer.close(() => {
                            done(err);
                        });
                    }
                });
        });
    });

    describe("inferPackageEntryPointPaths", () => {
        using fixture = tempdirProject();
        afterEach(() => fixture.rm());
        const packagePath = (path: string) => normalizePath(join(fixture.cwd, path));

        const inferExports = () =>
            inferPackageEntryPointPaths(fixture.cwd + "/package.json", fs).map(
                (s) => [s[0], normalizePath(s[1])],
            );

        it("Supports string exports shorthand", () => {
            fixture.addJsonFile("package.json", {
                main: "./main.js",
                exports: "./exp.js",
            });
            fixture.write();

            equal(inferExports(), [[".", packagePath("exp.js")]]);
        });

        it("Uses the main field if exports are not defined", () => {
            fixture.addJsonFile("package.json", {
                main: "./main.js",
            });
            fixture.write();

            equal(inferExports(), [[".", packagePath("main.js")]]);
        });

        it("Supports simple object exports", () => {
            fixture.addJsonFile("package.json", {
                exports: {
                    ".": "main.js",
                    foo: "foo.js",
                },
            });
            fixture.write();

            equal(inferExports(), [
                [".", packagePath("main.js")],
                ["foo", packagePath("foo.js")],
            ]);
        });

        it("Uses export conditions", () => {
            fixture.addJsonFile("package.json", {
                exports: {
                    ".": "main.js",
                    a: {
                        typedoc: "a.ts",
                        default: "a.js",
                    },
                    b: {
                        import: "b.ts",
                        default: "b.js",
                    },
                    c: {
                        node: "c.ts",
                        default: "c.js",
                    },
                    d: {
                        "not-recognized": "d.ts",
                        default: "d.js",
                    },
                },
            });
            fixture.write();

            equal(inferExports(), [
                [".", packagePath("main.js")],
                ["a", packagePath("a.ts")],
                ["b", packagePath("b.ts")],
                ["c", packagePath("c.ts")],
                ["d", packagePath("d.js")],
            ]);
        });

        it("Handles arrays of export conditions", () => {
            fixture.addJsonFile("package.json", {
                exports: {
                    ".": ["main.js"],
                    a: ["does-not-exist.js", "exists.js"],
                },
            });
            fixture.addFile("main.js");
            fixture.addFile("exists.js");
            fixture.write();

            equal(inferExports(), [
                [".", packagePath("main.js")],
                ["a", packagePath("exists.js")],
            ]);
        });

        it("Handles nested export conditions", () => {
            fixture.addJsonFile("package.json", {
                exports: {
                    a: {
                        notMatched: {
                            typedoc: "nope.js",
                        },
                        typedoc: {
                            node: "a.ts",
                        },
                        default: "a.js",
                    },
                },
            });
            fixture.write();

            equal(inferExports(), [["a", packagePath("a.ts")]]);
        });

        it("Handles a single wildcard", () => {
            fixture.addJsonFile("package.json", {
                exports: {
                    "a/*.js": "src/*.js",
                    "b/*.js": "src/*/*.ts",
                },
            });
            fixture.addFile("src/1.js");
            fixture.addFile("src/2.js");
            fixture.addFile("src/3/4.js");
            fixture.addFile("src/5.ts");
            fixture.addFile("src/6/6.ts");
            fixture.write();

            equal(inferExports(), [
                ["a/1.js", packagePath("src/1.js")],
                ["a/2.js", packagePath("src/2.js")],
                ["a/3/4.js", packagePath("src/3/4.js")],
                ["b/6.js", packagePath("src/6/6.ts")],
            ]);
        });
    });
});
