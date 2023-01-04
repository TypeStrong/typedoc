import * as fs from "fs";
import { createServer } from "net";
import { Project, tempdirProject } from "@typestrong/fs-fixture-builder";
import { AssertionError, deepStrictEqual as equal } from "assert";
import { basename, dirname, resolve, normalize } from "path";
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
            equal(result.map(normalize), [fix.cwd].map(normalize));
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

        describe("when 'followSymlinks' option is true", () => {
            it("should navigate symlinked directories", () => {
                const target = dirname(fix.dir("a").addFile("test.ts").path);
                fix.write();
                fs.symlinkSync(target, resolve(fix.cwd, "b"), "junction");
                equal(
                    glob(`${fix.cwd}/b/*.ts`, fix.cwd, {
                        followSymlinks: true,
                    }).map((f) => basename(f)),
                    ["test.ts"]
                );
            });

            it("should navigate recursive symlinked directories only once", () => {
                fix.addFile("test.ts");
                fix.write();
                fs.symlinkSync(
                    fix.cwd,
                    resolve(fix.cwd, "recursive"),
                    "junction"
                );
                equal(
                    glob(`${fix.cwd}/**/*.ts`, fix.cwd, {
                        followSymlinks: true,
                    }).map((f) => basename(f)),
                    ["test.ts", "test.ts"]
                );
            });

            it("should handle symlinked files", function () {
                const { path } = fix.addFile("test.ts");
                fix.write();
                try {
                    fs.symlinkSync(
                        path,
                        resolve(dirname(path), "test-2.ts"),
                        "file"
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
                    glob(`${fix.cwd}/**/*.ts`, fix.cwd, {
                        followSymlinks: true,
                    }).map((f) => basename(f)),
                    ["test-2.ts", "test.ts"]
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
                        equal(glob(`${fix.cwd}/*.sock`, fix.cwd), []);
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
});
