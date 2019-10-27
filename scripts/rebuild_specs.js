// @ts-check

const fs = require('fs-extra');
const path = require('path');
const TypeDoc = require('..');

const app = new TypeDoc.Application({
    mode: 'Modules',
    target: 'ES5',
    module: 'CommonJS',
    experimentalDecorators: true,
    jsx: 'react',
    lib: [
        "lib.dom.d.ts",
        "lib.es5.d.ts",
        "lib.es2015.iterable.d.ts",
        "lib.es2015.collection.d.ts"
    ],
});

const base = path.join(__dirname, '../src/test/converter');

/** @type {[string, () => void, () => void][]} */
const conversions = [
    ['specs', () => { }, () => { }],
    ['specs-without-exported',
        () => app.options.setValue('excludeNotExported', true),
        () => app.options.setValue('excludeNotExported', false)
    ],
    ['specs-with-lump-categories',
        () => app.options.setValue('categorizeByGroup', false),
        () => app.options.setValue('categorizeByGroup', true)
    ],
]

fs.remove(path.join(__dirname, '../src/test/renderer/specs'))
    .then(() => fs.readdir(base))
    .then(dirs => {
        // Get converter directories
        return Promise.all(dirs.map(dir => {
            const dirPath = path.join(base, dir);
            return Promise.all([dirPath, fs.stat(dirPath)]);
        }));
    }).then(dirs => {
        // Rebuild converter specs
        return dirs.map(([fullPath, stat]) => {
            if (!stat.isDirectory()) return;

            console.log(fullPath);
            const src = app.expandInputFiles([fullPath]);
            return Promise.all(conversions.map(([file, before, after]) => {
                const out = path.join(fullPath, `${file}.json`);
                if (fs.existsSync(out)) {
                    TypeDoc.resetReflectionID();
                    before();
                    const result = app.convert(src);
                    const data = JSON.stringify(result.toObject(), null, '  ')
                        .split(TypeDoc.normalizePath(base))
                        .join('%BASE%');
                    after();
                    return fs.writeFile(out, data);
                }
            }));
        })
    }).then(() => {
        // Rebuild renderer example
        const src = path.join(__dirname, '../examples/basic/src');
        const out = path.join(__dirname, '../src/test/renderer/specs');

        return fs.remove(out)
            .then(() => app.generateDocs(app.expandInputFiles([src]), out))
            .then(() => fs.remove(path.join(out, 'assets')))
            .then(() => out);
    }).then(out => {
        // Rewrite GitHub urls

        /**
         * Avoiding sync methods here is... difficult.
         * @param {string} base
         * @param {string} dir
         * @param {string[]} results
         * @returns {string[]}
         */
        function getFiles(base, dir = '', results = []) {
            const files = fs.readdirSync(path.join(base, dir));
            for (const file of files) {
                const relativeToBase = path.join(dir, file);
                if (fs.statSync(path.join(base, relativeToBase)).isDirectory()) {
                    getFiles(base, relativeToBase, results);
                } else {
                    results.push(relativeToBase);
                }
            }
            return results;
        }

        const gitHubRegExp = /https:\/\/github.com\/[A-Za-z0-9\-]+\/typedoc\/blob\/[^\/]*\/examples/g;
        return getFiles(out).map(file => {
            const full = path.join(out, file);
            return fs.readFile(full, { encoding: 'utf-8' })
                .then(text => fs.writeFile(
                    full,
                    text.replace(gitHubRegExp, 'https://github.com/sebastian-lenz/typedoc/blob/master/examples')
                ));
        });
    })
    .catch(reason => {
        console.error(reason);
        process.exit(1);
    });
