//@ts-check

const { remove, copy } = require("../dist/lib/utils/fs");
const { join } = require("path");

const expectedDir = join(__dirname, "../dist/tmp/.reg/expected");
const outputDir = join(__dirname, "../dist/tmp/__screenshots__");

remove(expectedDir)
    .then(() => copy(outputDir, expectedDir))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
