// @ts-check
const marked = require("marked");
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
    if (process.argv.length !== 3) {
        console.log("Usage: node scripts/testcase.js <issue number>");
        process.exit(1);
    }

    const issue = process.argv[2];
    const data = JSON.parse(await exec(curl.replace("ISSUE", issue)));

    const lexer = new marked.Lexer({ gfm: true });
    const tokens = lexer.lex(data.body);

    const code = /** @type {marked.marked.Tokens.Code} */ (
        tokens.find(
            (tok) =>
                tok.type === "code" &&
                ["ts", "tsx", "js", "jsx"].includes(tok.lang || ""),
        ) || tokens.find((tok) => tok.type === "code")
    );
    if (!code) {
        console.log("No codeblock found");
        const file = `src/test/converter2/issues/gh${issue}.ts`;
        await exec(`code ${file}`);
        return;
    }

    const file = `src/test/converter2/issues/gh${issue}${guessExtension(code)}`;
    await writeFile(file, code.text);
    await exec(`code ${file} src/test/issues.c2.test.ts`);
}

void main();
