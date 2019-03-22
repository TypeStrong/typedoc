// @ts-check

const fs = require('fs-extra');
const { join } = require('path');

const file = join(__dirname, '../dist/lib/application.js');

Promise.all([
    fs.readJson(join(__dirname, '../package.json')).then(({ version }) => version),
    fs.readFile(file, { encoding: 'utf-8' })
]).then(([version, text]) => {
    return fs.writeFile(file, text.replace(/{{ VERSION }}/g, version));
}).catch(reason => {
    console.error(reason);
    process.exit(1);
});
