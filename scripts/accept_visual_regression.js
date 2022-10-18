//@ts-check

require("ts-node/register");

const fs = require("fs/promises");
const { copy } = require("../src/lib/utils/fs");
const { join } = require("path");

const expectedDir = join(__dirname, "../dist/tmp/.reg/expected");
const outputDir = join(__dirname, "../dist/tmp/__screenshots__");

fs.rm(expectedDir, { recursive: true, force: true })
    .then(() => copy(outputDir, expectedDir))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
