// @ts-check
const md = require("markdown-it");
const cp = require("child_process");
const { writeFile } = require("fs/promises");

const curl = `curl -s -L -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" https://api.github.com/repos/typestrong/typedoc/issues/ISSUE`;

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

/** @param {marked.marked.Tokens.Code} code */
function guessExtension(code) {
    switch (code.lang) {
        case "js":
        case "jsx":
            return ".js";
        case "tsx":
            return ".tsx";
    }

    return ".ts";
}

async function main() {
    if (process.argv.length !== 3 && process.argv.length !== 4) {
        console.log("Usage: node scripts/testcase.js <issue number> [lang]");
        process.exit(1);
    }

    const issue = process.argv[2];
    const data = JSON.parse(await exec(curl.replace("ISSUE", issue)));

    const parser = md();
    const tokens = parser.parse(data.body, {});

    const code =
        tokens.find(
            (tok) =>
                tok.tag === "code" &&
                ["ts", "tsx", "js", "jsx"].includes(tok.info || ""),
        ) || tokens.find((tok) => tok.tag === "code");

    if (!code) {
        console.log("No codeblock found");
        const file = `src/test/converter2/issues/gh${issue}.ts`;
        await exec(`code ${file}`);
        return;
    }

    const ext = process.argv[3] ? `.${process.argv[3]}` : guessExtension(code);
    const file = `src/test/converter2/issues/gh${issue}${ext}`;
    await writeFile(file, code.content);
    await exec(`code ${file} src/test/issues.c2.test.ts`);
}

void main();
