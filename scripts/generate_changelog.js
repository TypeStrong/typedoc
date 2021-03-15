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
const OLDEST_CHANGELOG_COMMIT = "f388b42d1a16656681bedfc45f33f1d856441c58";

const categories = [
    { prefix: "BREAKING CHANGE", category: "Breaking Changes" },
    { prefix: "feat", category: "Features" },
    { prefix: "fix", category: "Bug Fixes" },
];

const maintainers = new Set(["Gerrit Birkeland", "dependabot[bot]"]);

/** @param {string} since */
async function getLogs(since) {
    const { stdout: log } = await promisify(
        exec
    )(
        `git log --pretty="format:%H%x00%at%x00%an%x00%B%x00" --no-merges ${since}..master`,
        { encoding: "utf-8" }
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
 * @param {string} target
 */
function getHeader(version, date, target) {
    // In github mode, we're only generating the changelog for a single release.
    if (target === "github") return;

    version = version.trim();

    const dateString = `(${date.getFullYear()}-${date
        .getUTCMonth()
        .toString()
        .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")})`;

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
 * @param {readonly LogEntry[]} entries
 * @param {string} target
 */
function groupByVersions(entries, target) {
    /** @type {[string, LogEntry[]][]} */
    const result = [];

    let header = "# Unreleased";
    /** @type {LogEntry[]} */
    let current = [];

    for (const entry of entries) {
        const match = entry.message.match(/^chore: Bump version to (.*)/m);
        if (match) {
            // Beta version bump
            if (match[1].includes("-")) {
                continue;
            }

            if (current.length > 0) {
                result.push([header, current]);
            }
            header = getHeader(match[1], entry.date, target);
            current = [];
            continue;
        }

        current.push(entry);
    }

    if (current.length > 0) {
        result.push([header, current]);
    }

    return result;
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

    return thanks;
}

/**
 * @param {string} commit
 * @param {string} target
 */
function commitLink(commit, target) {
    if (target === "github") {
        return commit;
    }

    return `[${commit.substr(
        0,
        7
    )}](https://github.com/TypeStrong/typedoc/commit/${commit})`;
}

/**
 * @param {string} message
 * @param {string} target
 */
function issueLinks(message, target) {
    /** @type {Set<string>} */
    const issues = new Set();

    for (const match of matchAll(
        /(close|resolve|fixe?)[sd]? #(\d+)/gi,
        message
    )) {
        if (target == "github") {
            issues.add(`#${match[2]}`);
        } else {
            const url = `https://github.com/TypeStrong/typedoc/issues/${match[2]}`;
            issues.add(`[#${match[2]}](${url})`);
        }
    }

    if (issues.size === 0) {
        return "";
    }
    return [", closes", [...issues].join(", ")].join(" ");
}

/**
 * @param {readonly LogEntry[]} commits
 * @param {string} target
 */
function getCategories(commits, target) {
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
                            ` (${commitLink(commit.commit, target)})`,
                            issueLinks(commit.message, target),
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
 * @param {string} target
 */
function getBody(commits, target) {
    /** @type {string[]} */
    const lines = [];

    for (const [name, body] of getCategories(commits, target)) {
        lines.push(`### ${name}`, "", body, "");
    }

    const thanks = getThanks(commits);
    if (thanks.size) {
        lines.push(`### Thanks!`, "", ...[...thanks].map((t) => ` * ${t}`), "");
    }

    lines.pop();
    return lines.join("\n");
}

async function main(
    since = OLDEST_CHANGELOG_COMMIT,
    where = "CHANGELOG.md",
    target = "standalone" // standalone | github
) {
    const entries = await getLogs(since);

    /** @type {string[]} */
    const out = [];

    for (const [header, commits] of groupByVersions(entries, target)) {
        if (header) {
            out.push(header, "");
        }
        out.push(getBody(commits, target), "", "");
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
