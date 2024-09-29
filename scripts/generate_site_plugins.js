// @ts-check
const PLUGIN_QUERY = `https://www.npmjs.com/search?q=keywords%3Atypedoc-plugin keywords%3Atypedocplugin`;
const THEME_QUERY = `https://www.npmjs.com/search?q=keywords%3Atypedoc-theme`;

import * as cp from "child_process";
import { promises as fs, mkdirSync } from "fs";
import semver from "semver";

const CACHE_ROOT = "tmp/site-cache";
mkdirSync(CACHE_ROOT, { recursive: true });

const EXCLUDED_PLUGINS = [
    // Fork not intended for public use.
    "@zamiell/typedoc-plugin-markdown",
    "@convex-dev/typedoc-plugin-markdown",
    "@jberesford/typedoc-plugin-mdn-links",
    "@jsprismarine/typedoc-material-theme",

    // Custom plugins/themes for other libraries, likely not useful to most people.
    "@initializer-utils/typedoc-theme",
    "@colony/typedoc-plugin-markdown",
    "@gobstones/typedoc-theme-gobstones",
    "jsonforms-typedoc-theme",
    "typedoc-jsonforms-theme",
    "suika-docs-theme",
];

const EXCLUDED_PLUGIN_USERS = [
    // Forked typedoc-plugin-markdown, did not abide by license.
    "acceleratxr",
    // Has forked several plugins & published, forks do not appear to be for general use.
    "silei",
    "tivmof",
];

/** @type {(command: string) => Promise<string>} */
function exec(command) {
    return new Promise((resolve, reject) => {
        cp.exec(command, (err, stdout) => {
            if (err) reject(err);
            else resolve(stdout);
        });
    });
}

/** @param {string} npmPackage */
async function getSupportedVersions(npmPackage) {
    const version = await exec(
        `npm view ${npmPackage} peerDependencies.typedoc`,
    );
    return version.trim();
}

/**
 * @typedef {object} NpmPackage
 * @prop {string} name
 * @prop {{ name: string}} publisher
 * @prop {string} description
 * @prop {{ ts: number; rel: string}} date
 * @prop {NpmLinks} links
 * @prop {string} version
 */

/**
 * @typedef {NpmPackage & { peer: string}} NpmPackageWithPeer
 */

/**
 * @typedef {object} NpmLinks
 * @prop {string} npm
 * @prop {string?} repository
 * @prop {string?} homepage
 */

/**
 * @typedef {object} PackagesResponse
 * @prop {number} total
 * @prop {{ package: NpmPackage }[]} objects
 */

/**
 * @param {string} query
 * @returns {Promise<NpmPackage[]>}
 */
async function getAllPackages(query) {
    let page = 0;
    let total = 0;
    /** @type {NpmPackage[]} */
    const result = [];

    do {
        /** @type {PackagesResponse} */
        const data = await (
            await fetch(`${query}&page=${page++}`, {
                headers: {
                    // Ask for JSON. Hasn't changed since 2018 at least...
                    "x-spiferack": "1",
                },
            })
        ).json();

        total = data.total;
        result.push(...data.objects.map((x) => x.package));
    } while (result.length < total);

    return result;
}

/**
 * @param {string} typedocVersion
 * @param {NpmPackageWithPeer[]} plugins
 * @returns {NpmPackageWithPeer[]}
 */
function getSupportingPlugins(typedocVersion, plugins) {
    /** @type {NpmPackageWithPeer[]} */
    const supported = [];

    for (const plugin of plugins) {
        if (EXCLUDED_PLUGINS.includes(plugin.name)) continue;
        if (EXCLUDED_PLUGIN_USERS.includes(plugin.publisher.name)) continue;

        let version = plugin.peer.trim();
        if (!version) continue;

        // Any plugin which declares a version with ">=" with no upper bound
        // should really have used "^", so rewrite it to that instead.
        if (version.includes(">=") && !version.includes("<")) {
            version = version.replace(/>=/g, "^");
        }

        // Any plugin which claims compatibility with a version far in the future is lying.
        // They can't possibly know that it satisfies this, so exclude them because we can't
        // reliably figure out what version they do actually support.
        if (semver.satisfies("0.99.0", version)) continue;

        if (semver.satisfies(typedocVersion, version)) {
            supported.push(plugin);
        }
    }

    return supported;
}

/**
 * @template T
 * @param {string} filename
 * @param {() => Promise<T>} getter
 * @returns {Promise<T>}
 */
async function getLocalCache(filename, getter) {
    try {
        return JSON.parse(
            await fs.readFile(CACHE_ROOT + "/" + filename, "utf-8"),
        );
    } catch {
        const data = await getter();
        if (process.env.CI !== "true") {
            await fs.writeFile(
                CACHE_ROOT + "/" + filename,
                JSON.stringify(data, null, 2),
                "utf-8",
            );
        }
        return data;
    }
}

/**
 * @param {NpmPackage[]} plugins
 * @returns {Promise<string[]>}
 */
function getAllVersions(plugins) {
    return Promise.all(plugins.map((p) => getSupportedVersions(p.name)));
}

/**
 *
 * @param {NpmPackageWithPeer[]} plugins
 * @param {string[]} checkVersions
 * @param {string} path
 */
async function createInclude(plugins, checkVersions, path) {
    /** @type {string[]} */
    const out = [];

    for (const typedocVersion of checkVersions) {
        out.push(`## v${typedocVersion.replace(/\.\d+$/, "")}\n`);

        for (const plugin of getSupportingPlugins(typedocVersion, plugins).sort(
            (a, b) => b.date.ts - a.date.ts,
        )) {
            out.push(`<div class="box">`);
            out.push(
                `    <p class="title"><a href="${plugin.links.npm}" target="_blank">${plugin.name}</a></p>`,
            );
            out.push(`    <p>${miniMarkdown(plugin.description || "")}</p>`);
            out.push(`    <p>
                <a href="https://www.npmjs.com/~${plugin.publisher.name}" target="_blank">${plugin.publisher.name}</a> published ${plugin.version} • ${plugin.date.rel}
            </p>`);
            out.push(`</div>\n`);
        }

        out.push("\n");
    }

    await fs.writeFile(path, out.join("\n"), "utf-8");
}

/**
 * @param {string} text
 * @returns {string}
 */
function miniMarkdown(text) {
    return escapeHtml(text)
        .replace(
            /\[(.*?)\]\((https?:\/\/.*?)\)/g,
            (_, text, link) => `<a href="${link}" target="_blank">${text}</a>`,
        )
        .replace(/`(.*?)`/g, "<code>$1</code>");
}

/**
 * @param {string} html
 */
function escapeHtml(html) {
    return html.replace(
        /[&<>'"]/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[c],
    );
}

async function main() {
    console.log("Getting themes...");
    const themes = await getLocalCache("themes.json", () =>
        getAllPackages(THEME_QUERY),
    );

    console.log("Getting plugins...");
    const plugins = await getLocalCache("plugins.json", async () =>
        (await getAllPackages(PLUGIN_QUERY)).filter(
            (pack) => !themes.some((t) => t.name === pack.name),
        ),
    );

    console.log("Getting typedoc versions...");
    const versions = await getLocalCache("versions.json", () =>
        getAllVersions(plugins),
    );

    const withVersions = plugins.map((plug, i) =>
        Object.assign(plug, { peer: versions[i] }),
    );

    const typedocVersions = JSON.parse(
        await exec("npm view typedoc@* versions --json"),
    ).filter((s) => typeof s === "string" && !s.includes("-"));

    const checkVersions = [typedocVersions[typedocVersions.length - 1]];
    let index = typedocVersions.length - 1;
    let lastMinor = semver.parse(checkVersions[0])?.minor ?? 0;

    while (checkVersions.length < 3) {
        const currentVersion = semver.parse(typedocVersions[index]);
        if ((currentVersion?.minor ?? 0) < lastMinor) {
            checkVersions.push(typedocVersions[index]);
            lastMinor = currentVersion?.minor ?? 0;
        }
        index--;
    }

    await createInclude(
        withVersions,
        checkVersions,
        "site/generated/plugins.md",
    );

    console.log("Getting theme versions...");
    const themeVersions = await getLocalCache("theme_versions.json", () =>
        getAllVersions(themes),
    );

    const themesWithVersions = themes.map((plug, i) =>
        Object.assign(plug, { peer: themeVersions[i] }),
    );

    // v0.23 - this needs to be updated.
    await createInclude(
        themesWithVersions,
        checkVersions,
        "site/generated/themes.md",
    );
    console.log("Finished getting themes");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
