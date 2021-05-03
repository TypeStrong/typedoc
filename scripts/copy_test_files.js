// @ts-check

const fs = require("fs-extra");
const { join } = require("path");
const { spawn } = require("child_process");

function promiseFromChildProcess(childProcess) {
    return new Promise(function (resolve, reject) {
        childProcess.on("error", function (error) {
            reject(
                new Error(
                    childProcess.spawnargs.join(" ") + " : " + error.message
                )
            );
        });
        childProcess.on("exit", function (code) {
            if (code !== 0) {
                reject(
                    new Error(
                        childProcess.spawnargs.join(" ") +
                            " : exited with code " +
                            code
                    )
                );
            } else {
                resolve();
            }
        });
    });
}

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

function ensureNpmVersion() {
    return Promise.resolve().then(() => {
        const npmProc = spawn(npmCommand, ["--version"], {
            stdio: ["ignore", "pipe", "inherit"],
        });
        let npmVersion = "";
        npmProc.stdout.on("data", (data) => {
            npmVersion += data;
        });
        return promiseFromChildProcess(npmProc).then(() => {
            npmVersion = npmVersion.trim();
            let firstDot = npmVersion.indexOf(".");
            const npmMajorVer = parseInt(
                npmVersion.slice(0, npmVersion.indexOf("."))
            );
            if (npmMajorVer < 7) {
                throw new Error(
                    "npm version must be at least 7, version installed is " +
                        npmVersion
                );
            }
        });
    });
}

function prepareMonorepoFolder() {
    return Promise.resolve()
        .then(() => {
            return promiseFromChildProcess(
                spawn(
                    "git",
                    ["clone", "https://github.com/efokschaner/ts-monorepo.git"],
                    {
                        cwd: join(__dirname, "../dist/test/packages"),
                        stdio: "inherit",
                    }
                )
            );
        })
        .then(() => {
            return promiseFromChildProcess(
                spawn(
                    "git",
                    ["checkout", "73bdd4c6458ad4cc3de35498e65d55a1a44a8499"],
                    {
                        cwd: join(
                            __dirname,
                            "../dist/test/packages/ts-monorepo"
                        ),
                        stdio: "inherit",
                    }
                )
            );
        })
        .then(() => {
            return promiseFromChildProcess(
                spawn(npmCommand, ["install"], {
                    cwd: join(__dirname, "../dist/test/packages/ts-monorepo"),
                    stdio: "inherit",
                })
            );
        })
        .then(() => {
            return promiseFromChildProcess(
                spawn(npmCommand, ["run", "build"], {
                    cwd: join(__dirname, "../dist/test/packages/ts-monorepo"),
                    stdio: "inherit",
                })
            );
        });
}

function prepareSinglePackageExample() {
    return Promise.resolve().then(() => {
        return promiseFromChildProcess(
            spawn(npmCommand, ["run", "build"], {
                cwd: join(
                    __dirname,
                    "../dist/test/packages/typedoc-single-package-example"
                ),
                stdio: "inherit",
            })
        );
    });
}

const copy = [
    "test/converter",
    "test/converter2",
    "test/renderer",
    "test/module",
    "test/packages",
    "test/utils/options/readers/data",
];

const copies = copy.map((dir) => {
    const source = join(__dirname, "../src", dir);
    const target = join(__dirname, "../dist", dir);
    return fs
        .remove(target)
        .then(() => fs.mkdirp(target))
        .then(() => fs.copy(source, target));
});

Promise.all(copies)
    .then(ensureNpmVersion)
    .then(() =>
        Promise.all([prepareMonorepoFolder(), prepareSinglePackageExample()])
    )
    .catch((reason) => {
        console.error(reason);
        process.exit(1);
    });
