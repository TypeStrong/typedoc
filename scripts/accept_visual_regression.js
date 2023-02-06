//@ts-check

const fs = require("fs/promises");
const { copy } = require("../dist/lib/utils/fs");
const { join } = require("path");

const expectedDir = join(__dirname, "../tmp/baseline");
const outputDir = join(__dirname, "../tmp/screenshots");

fs.rm(expectedDir, { recursive: true, force: true })
    .then(() => copy(outputDir, expectedDir))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
