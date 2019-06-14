// @ts-check

const fs = require('fs-extra');
const path = require('path');
const TypeDoc = require(path.join(__dirname, '..'));

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
    name: 'typedoc'
});

const base = path.join(__dirname, '../src/test/converter');

fs.remove(path.join(__dirname, '../src/test/renderer/specs'))
    .then(() => fs.readdir(base))
    .then(dirs => {
        // Get converter directories
        return Promise.all(dirs.map(dir => {
            const dirPath = path.join(base, dir);
            return Promise.all([ dirPath, fs.stat(dirPath) ]);
        }));
    }).then(dirs => {
        // Rebuild converter specs
        return dirs.map(([ fullPath, isDir ]) => {
            if (!isDir) return;

            console.log(fullPath);
            TypeDoc.resetReflectionID();
            const src = app.expandInputFiles([ fullPath ]);
            const out = path.join(fullPath, 'specs.json');
            const result = app.convert(src);
            const data = JSON.stringify(result.toObject(), null, '  ')
                .split(TypeDoc.normalizePath(base))
                .join('%BASE%');

            return fs.writeFile(out, data);
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
