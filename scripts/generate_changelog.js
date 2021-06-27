// @ts-check

/**
 * @typedef LogEntry
 * @property {string} commit
 * @property {Date} date
 * @property {string} author
 * @property {string} message
 */

const { exec } = require("child_process");
const { promises: fs } = require("fs");
const { promisify } = require("util");
const assert = require("assert");

// Commits older than this didn't follow conventional commits, so there's no
// easy way to guess how to categorize them.
const OLDEST_VERSION = "v0.16.5";

const categories = [
    { prefix: "BREAKING CHANGE", category: "Breaking Changes" },
    { prefix: "feat", category: "Features" },
    { prefix: "fix", category: "Bug Fixes" },
];

const maintainers = new Set(["Gerrit Birkeland", "dependabot[bot]"]);

/** @param {string} command */
async function run(command) {
    const result = await promisify(exec)(command, {
        encoding: "utf-8",
    });
    return result.stdout;
}

async function getVersions() {
    const VERSION_REGEX = /^v(\d+)\.(\d+)\.(\d+)$/;

    const tags = await run("git tag -l");
    const versionTags = tags.split("\n").filter((t) => VERSION_REGEX.test(t));

    versionTags.sort((a, b) => {
        const [a1, a2, a3] = a
            .match(VERSION_REGEX)
            .slice(1)
            .map((v) => parseInt(v));
        const [b1, b2, b3] = b
            .match(VERSION_REGEX)
            .slice(1)
            .map((v) => parseInt(v));

        if (a1 == b1) {
            if (a2 == b2) {
                return b3 - a3;
            }
            return b2 - a2;
        }
        return b1 - a1;
    });

    return versionTags.slice(0, versionTags.indexOf(OLDEST_VERSION));
}

/**
 * @param {string} previous
 * @param {string} version
 */
async function getLogs(previous, version) {
    const log = await run(
        `git log --pretty="format:%H%x00%at%x00%an%x00%B%x00" --no-merges ${previous}..${version}`
    );

    /** @type {LogEntry[]} */
    const entries = [];

    let last = 0;
    const match = () => {
        const next = log.indexOf("\x00", last);
        assert(next !== -1);
        const result = log.substring(last, next).trim();
        last = next + 1;
        return result;
    };

    while (last < log.length - 1) {
        const commit = match();
        const date = new Date(1000 * +match());
        const author = match();
        const message = match();

        entries.push({ commit, date, author, message });
    }

    return entries;
}

/**
 * @param {string} version
 * @param {Date} date
 */
function getHeader(version, date) {
    version = version.trim();

    const month = date.getUTCMonth().toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const dateString = ` (${date.getFullYear()}-${month}-${day})`;

    if (/^\d+\.\d+\.\d+$/.test(version)) {
        const [_major, minor, patch] = version.split(".");

        let level = 2;
        if (parseInt(patch) == 0) level--;
        if (parseInt(minor) == 0) level--;

        return `${"#".repeat(Math.max(level, 1))} ${version}${dateString}`;
    }

    return `# ${version}${dateString}`;
}

/**
 * @param {RegExp} regex
 * @param {string} str
 */
function* matchAll(regex, str) {
    let match;
    while ((match = regex.exec(str))) {
        yield match;
    }
}

/** @param {readonly LogEntry[]} commits */
function getThanks(commits) {
    /** @type {Set<string>} */
    const thanks = new Set();

    for (const commit of commits) {
        thanks.add(commit.author);

        for (const extra of matchAll(
            /^Co-Authored-By: (.*?)( <.*>)?$/gm,
            commit.message
        )) {
            thanks.add(extra[1]);
        }
    }

    for (const person of maintainers) {
        thanks.delete(person);
    }

    return [...thanks].sort((a, b) =>
        a.localeCompare(b, "en-us", { sensitivity: "base" })
    );
}

/**
 * @param {string} commit
 */
function commitLink(commit) {
    return `[${commit.substr(
        0,
        7
    )}](https://github.com/TypeStrong/typedoc/commit/${commit})`;
}

/**
 * @param {string} message
 */
function issueLinks(message) {
    /** @type {Set<string>} */
    const issues = new Set();

    for (const match of matchAll(
        /(close|resolve|fixe?)[sd]? #(\d+)/gi,
        message
    )) {
        const url = `https://github.com/TypeStrong/typedoc/issues/${match[2]}`;
        issues.add(`[#${match[2]}](${url})`);
    }

    if (issues.size === 0) {
        return "";
    }
    return [", closes", [...issues].join(", ")].join(" ");
}

/**
 * @param {readonly LogEntry[]} commits
 */
function getCategories(commits) {
    /** @type {Map<string, string>} */
    const result = new Map();

    for (const { prefix, category } of categories) {
        /** @type {string[]} */
        const lines = [];

        for (const commit of commits) {
            for (const line of commit.message.split("\n")) {
                if (line.startsWith(prefix)) {
                    lines.push(
                        [
                            " * ",
                            line.replace(/^[^:]+:\s*/, ""),
                            ` (${commitLink(commit.commit)})`,
                            issueLinks(commit.message),
                        ].join("")
                    );
                }
            }
        }

        if (lines.length > 0) {
            result.set(category, lines.join("\n"));
        }
    }

    return result;
}

/**
 * @param {readonly LogEntry[]} commits
 */
function getBody(commits) {
    /** @type {string[]} */
    const lines = [];

    for (const [name, body] of getCategories(commits)) {
        lines.push(`### ${name}`, "", body, "");
    }

    const thanks = getThanks(commits);
    if (thanks.length > 0) {
        lines.push(`### Thanks!`, "", ...thanks.map((t) => ` * ${t}`), "");
    }

    lines.pop();
    return lines.join("\n");
}

async function main(where = "CHANGELOG.md", fromVersion = OLDEST_VERSION) {
    const versions = await getVersions();
    let end = versions.indexOf(fromVersion) + 1;
    if (end === 0) {
        if (fromVersion !== OLDEST_VERSION) {
            throw new Error("Invalid version");
        }
        end = versions.length;
    }

    /** @type {string[]} */
    const out = [];

    for (let i = 0; i < end; i++) {
        const logs = await getLogs(
            i + 1 === versions.length ? OLDEST_VERSION : versions[i + 1],
            versions[i]
        );
        assert(logs.length > 0, `${versions[i]} has no commit logs`);

        if (end !== 1) {
            out.push(getHeader(versions[i], logs[0].date), "");
        }

        out.push(getBody(logs), "");
    }

    out.pop();

    if (where == "-") {
        console.log(out.join("\n"));
    } else {
        await fs.writeFile(where, out.join("\n"), { encoding: "utf-8" });
    }
}

main(...process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exit(1);
});
