// @ts-check

const cp = require("child_process");
const { join } = require("path");
const https = require("https");

const REMOTE = "origin";
const REPO = "TypeStrong/typedoc";

/**
 * @param {string} cmd
 * @returns {Promise<string>}
 */
function exec(cmd) {
    return new Promise((resolve, reject) => {
        cp.exec(cmd, { encoding: "utf-8" }, (err, stdout, stderr) => {
            if (err) return reject(err);

            if (stderr.trim().length) {
                return reject(new Error(stderr));
            }

            resolve(stdout.trim());
        });
    });
}

async function createGitHubRelease(args) {
    const data = JSON.stringify(args);

    const options = {
        hostname: "api.github.com",
        path: `/repos/${REPO}/releases`,
        method: "POST",
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "User-Agent": "Node",
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 201) {
                reject(new Error(res.statusMessage || "Unknown status"));
            }

            const result = [];
            res.on("data", (d) => result.push(d.toString("utf-8")));
            res.on("close", () => resolve(result.join("")));
        });

        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    const lastTag = await exec("git describe --tags --abbrev=0");
    const currentVersion = `v${
        require(join(__dirname, "..", "package.json")).version
    }`;

    if (lastTag == currentVersion) {
        console.log("No version change, not publishing.");
        return;
    }

    console.log(`Creating release ${currentVersion}`);

    console.log("Creating tag...");
    // Delete the tag if it exists already.
    await exec(`git tag -d ${currentVersion}`).catch(() => void 0);
    await exec(`git tag ${currentVersion}`);
    await exec(
        `git push ${REMOTE} refs/tags/${currentVersion} --quiet --force`
    );

    console.log("Creating release...");
    const changelog = await exec(
        `node ${join(__dirname, "generate_changelog.js")} ${lastTag} - github`
    );
    await createGitHubRelease({
        tag_name: currentVersion,
        name: currentVersion,
        body: changelog,
    });

    console.log("OK");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
