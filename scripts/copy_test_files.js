// @ts-check

const { remove, copy } = require("../dist/lib/utils/fs");
const { join } = require("path");

const toCopy = [
    "test/converter",
    "test/converter2",
    "test/module",
    "test/packages",
    "test/utils/options/readers/data",
    "test/slow/entry-points",
];

const copies = toCopy.map(async (dir) => {
    const source = join(__dirname, "../src", dir);
    const target = join(__dirname, "../dist", dir);
    await remove(target);
    await copy(source, target);
});

Promise.all(copies).catch((reason) => {
    console.error(reason);
    process.exit(1);
});
