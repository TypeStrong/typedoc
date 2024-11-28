// @ts-check
import * as cp from "child_process";
import { promises as fs, mkdirSync } from "fs";
import semver from "semver";

const CACHE_ROOT = "tmp/site-cache";
mkdirSync(CACHE_ROOT, { recursive: true });

// cspell: disable
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
// cspell: enable

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
 * @prop {string[]} keywords
 * @prop {string} version
 * @prop {string} description
 * @prop {{ username: string}} publisher
 * @prop {string} license
 * @prop {string} date
 * @prop {NpmLinks} links
 */

/**
 * @typedef {object} NpmLinks
 * @prop {string} npm
 * @prop {string?} repository
 * @prop {string?} homepage
 */

/**
 * @typedef {NpmPackage & { peer: string}} NpmPackageWithPeer
 */

/**
 * @param {string} query
 * @returns {Promise<NpmPackage[]>}
 */
async function getAllPackages(query) {
    const FORCE = process.env["CI"] ? " --prefer-online" : "";

    /** @type {NpmPackage[]} */
    const result = JSON.parse(
        await exec(
            `npm search "${query}" --json --long --searchlimit 1000${FORCE}`,
        ),
    );

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
        if (EXCLUDED_PLUGIN_USERS.includes(plugin.publisher.username)) continue;

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

/** @param {string} date */
function relativeDate(date) {
    const nowHours = Date.now() / 1000 / 60 / 60;
    const dateHours = Date.parse(date) / 1000 / 60 / 60;

    const deltaHours = nowHours - dateHours;
    if (deltaHours <= 24) {
        return "today";
    }

    const deltaDays = deltaHours / 24;
    if (deltaDays <= 7) {
        if (Math.floor(deltaDays) == 1) {
            return "1 day ago";
        }
        return `${Math.floor(deltaDays)} days ago`;
    }

    const deltaWeeks = Math.floor(deltaDays / 7);
    if (deltaWeeks <= 3) {
        return `${deltaWeeks} weeks ago`;
    }

    // Close enough...
    const deltaMonths = Math.floor(deltaDays / 30);
    if (deltaMonths <= 12) {
        if (deltaMonths < 2) {
            return "1 month ago";
        }
        return `${deltaMonths} months ago`;
    }

    const deltaYears = Math.floor(deltaDays / 365);
    if (deltaYears < 2) {
        return "1 year ago";
    }
    return `${deltaYears} years ago`;
}

/**
 * @param {NpmPackageWithPeer[]} plugins
 * @param {string[]} checkVersions
 * @param {string} path
 */
async function createInclude(plugins, checkVersions, path) {
    /** @type {string[]} */
    const out = [];

    for (const typedocVersion of checkVersions) {
        const supportingPlugins = getSupportingPlugins(
            typedocVersion,
            plugins,
        ).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

        if (supportingPlugins.length === 0) {
            continue;
        }

        out.push(`## v${typedocVersion.replace(/\.\d+$/, "")}\n`);

        for (const plugin of supportingPlugins) {
            out.push(`<div class="box">`);
            out.push(
                `    <p class="box-title"><a href="${plugin.links.npm}" target="_blank">${plugin.name}</a></p>`,
            );
            out.push(`    <p>${miniMarkdown(plugin.description || "")}</p>`);
            out.push(
                `    <p>`,
                `        <a href="https://www.npmjs.com/~${plugin.publisher.username}" target="_blank">${plugin.publisher.username}</a> •`,
                `        ${plugin.version} •`,
                `        ${relativeDate(plugin.date)} •`,
                `        ${plugin.license || "no license"}`,
                `    </p>`,
            );
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
        getAllPackages("keywords:typedoc-theme"),
    );

    console.log("Getting plugins...");
    const plugins = await getLocalCache("plugins.json", async () => {
        const plugins = await getAllPackages("keywords:typedoc-plugin");
        const plugins2 = await getAllPackages("keywords:typedocplugin");

        /** @type {NpmPackage[]} */
        const result = [];
        for (const pack of [...plugins, ...plugins2]) {
            if (
                !result.some((p) => p.name === pack.name) &&
                !themes.some((p) => p.name === pack.name)
            ) {
                result.push(pack);
            }
        }

        return result;
    });

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
