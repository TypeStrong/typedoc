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

// Note that this uses the test files in dist, not in src, this is important since
// when running the tests we copy the tests to dist and then convert them.
const base = path.join(__dirname, '../dist/test/converter');

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
];

/**
 * Rebuilds the converter specs for the provided dirs.
 * @param {string[]} dirs
 */
function rebuildConverterTests(dirs) {
    return Promise.all(dirs.map(fullPath => {
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
                return fs.writeFile(out.replace('dist', 'src'), data);
            }
        }));
    }));
}

async function rebuildRendererTest() {
    await fs.remove(path.join(__dirname, '../src/test/renderer/specs'));
    const src = path.join(__dirname, '../examples/basic/src');
    const out = path.join(__dirname, '../src/test/renderer/specs');

    await fs.remove(out)
    app.generateDocs(app.expandInputFiles([src]), out)
    await fs.remove(path.join(out, 'assets'))

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
}

async function main(command = 'all', filter = '') {
    if (!['all', 'converter', 'renderer'].includes(command)) {
        console.error('Invalid command. Usage: node scripts/rebuild_specs.js <all|converter|renderer> [filter]');
        throw new Error();
    }

    if (['all', 'converter'].includes(command)) {
        const dirs = await Promise.all((await fs.readdir(base)).map(dir => {
            const dirPath = path.join(base, dir);
            return Promise.all([dirPath, fs.stat(dirPath)]);
        }));

        await rebuildConverterTests(dirs.filter(([fullPath, stat]) => {
            if (!stat.isDirectory()) return false;
            return fullPath.endsWith(filter);
        }).map(([path]) => path));
    }

    if (['all', 'renderer'].includes(command)) {
        await rebuildRendererTest();
    }
}

main(process.argv[2], process.argv[3]).catch(reason => {
    console.error(reason);
    process.exit(1);
});
