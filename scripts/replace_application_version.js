// @ts-check

const fs = require("fs-extra");
const { join } = require("path");

const file = join(__dirname, "../dist/lib/application.js");

async function main() {
    const [package, text] = await Promise.all([
        fs.readJson(join(__dirname, "../package.json")),
        fs.readFile(file, { encoding: "utf-8" }),
    ]);

    const replacements = {
        VERSION: package.version,
        SUPPORTED: package.peerDependencies.typescript,
    };

    const replaced = text.replace(/{{ (VERSION|SUPPORTED) }}/g, (_, match) => {
        return replacements[match];
    });

    await fs.writeFile(file, replaced);
}

main().catch((reason) => {
    console.error(reason);
    process.exit(1);
});
