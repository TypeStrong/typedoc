#!/usr/bin/env node
// @ts-check
// Purpose: Download repos known to use TypeDoc's APIs for custom plugins/themes
// which are NOT published to NPM. This is used to check potentially-breaking
// changes which are likely not actually breaking anyone, so could be included
// in a patch release with little risk.

import cp from "node:child_process";
import fs from "node:fs/promises";
import { PQueue } from "./capture_screenshots.mjs";
import { ALL_API_USERS, API_USERS, OLD_API_USERS } from "./data/api_users.js";
import { parseArgs } from "node:util";
import { existsSync, readFileSync } from "node:fs";
import semver from "semver";

if (import.meta.url.endsWith(process.argv[1])) {
    const args = parseArgs({
        options: {
            jobs: {
                short: "j",
                type: "string",
                default: "6",
            },
            rebuild: {
                type: "boolean",
                default: false,
            },
            all: {
                type: "boolean",
                default: false,
            },
            output: {
                short: "o",
                type: "string",
                default: "../typedoc_api_users",
            },
        },
    });

    const rebuild = args.values.rebuild;
    const outDir = args.values.output;
    const jobs = parseInt(args.values.jobs) || 1;

    /**
     * @param {string[]} args
     * @returns {Promise<void>}
     */
    const git = (...args) =>
        new Promise((resolve, reject) => {
            const child = cp.spawn("git", args, { cwd: outDir, stdio: "inherit" });
            child.on("close", () => {
                if (child.exitCode) reject(new Error(`When executing git ${args.join(" ")}`));
                resolve();
            });
        });

    const start = Date.now();

    if (rebuild) {
        await fs.rm(outDir, { recursive: true, force: true });
    }
    await fs.mkdir(outDir, { recursive: true });

    const q = new PQueue(jobs);

    for (const { repo, branch, pkg = "package.json", filter } of args.values.all ? ALL_API_USERS : API_USERS) {
        q.add(async () => {
            const repoDir = `${repo.replace("/", "_")}`;
            if (!existsSync(`${outDir}/${repoDir}`)) {
                await git(
                    "clone",
                    "--quiet",
                    "--filter=blob:none",
                    "--no-checkout",
                    "--depth=1",
                    `git@github.com:${repo}.git`,
                    repoDir,
                );
            }

            await git("-C", repoDir, "fetch", "--quiet", "--depth=1", "origin", branch);

            const filterArg = Array.isArray(filter) ? filter : [filter];
            await git("-C", repoDir, "checkout", "--quiet", branch, "--", pkg, ...filterArg);
        });
    }

    try {
        await q.run();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

    console.log(`Cloning/updating took ${(Date.now() - start) / 1000} seconds`);

    // Check for repos listed in the wrong list
    const currentMinor = semver.parse(JSON.parse(readFileSync("package.json", "utf-8")).version)?.minor;
    console.log("Current minor is", currentMinor);

    for (const { repo, pkg = "package.json" } of API_USERS) {
        const repoDir = `${repo.replace("/", "_")}`;
        const manifest = JSON.parse(readFileSync(`${outDir}/${repoDir}/${pkg}`, "utf-8"));
        const depVersion = manifest.devDependencies?.typedoc || manifest.dependencies?.typedoc ||
            "(missing dependency)";
        const depMinor = semver.parse(depVersion.replace(/^[\^<=~]+/, ""))?.minor;

        if (depMinor !== currentMinor) {
            console.log(`API->OLD ${repo} ${depVersion}`);
        }
    }

    if (args.values.all) {
        for (const { repo, pkg = "package.json" } of OLD_API_USERS) {
            const repoDir = `${repo.replace("/", "_")}`;
            const manifest = JSON.parse(readFileSync(`${outDir}/${repoDir}/${pkg}`, "utf-8"));
            const depVersion = manifest.devDependencies?.typedoc || manifest.dependencies?.typedoc;
            if (!depVersion) {
                console.log(`OLD->DEL ${repo} (missing dependency)`);
                continue;
            }

            const depMinor = semver.parse(depVersion.replace(/^[\^<=~]+/, ""))?.minor;

            if (depMinor === currentMinor) {
                console.log(`OLD->API ${repo} ${depVersion}`);
            } else if (depMinor !== (currentMinor || 0) - 1) {
                console.log(`OLD->DEL ${repo} ${depVersion}`);
            }
        }
    }
}
