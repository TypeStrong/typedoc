import { Application, resetReflectionID, normalizePath, ProjectReflection } from '..';
import * as FS from 'fs';
import * as Path from 'path';
import Assert = require('assert');

const base = Path.join(__dirname, 'converter');

function normalizeSerialized(data: any) {
    return JSON.parse(JSON.stringify(data).split(normalizePath(base)).join('%BASE%'));
}

describe('Converter', function() {
    let app: Application;

    before('constructs', function() {
        app = new Application({
            mode:   'Modules',
            logger: 'none',
            target: 'ES5',
            module: 'CommonJS',
            experimentalDecorators: true,
            jsx: 'react',
            name: 'typedoc'
        });
    });

    const checks: [string, () => void, () => void][] = [
        ['specs', () => { }, () => { }],
        ['specs-without-exported',
            () => app.options.setValue('excludeNotExported', true),
            () => app.options.setValue('excludeNotExported', false)
        ],
        ['specs-with-lump-categories',
            () => app.options.setValue('categorizeByGroup', false),
            () => app.options.setValue('categorizeByGroup', true)
        ]
    ];

    FS.readdirSync(base).forEach(function (directory) {
        const path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) {
            return;
        }

        describe(directory, function() {
            for (const [file, before, after] of checks) {
                if (!FS.existsSync(Path.join(path, `${file}.json`))) {
                    continue;
                }

                let result: ProjectReflection | undefined;
                it(`[${file}] converts fixtures`, function() {
                    resetReflectionID();
                    before();
                    result = app.convert(app.expandInputFiles([path]));
                    after();
                    Assert(result instanceof ProjectReflection, 'No reflection returned');
                });

                it (`[${file}] matches specs`, function() {
                    const specs = JSON.parse(FS.readFileSync(Path.join(path, `${file}.json`), 'utf-8'));
                    Assert.deepStrictEqual(normalizeSerialized(result!.toObject()), specs);
                });
            }
        });
    });
});

describe('Converter with categorizeByGroup=false', function() {
    const base = Path.join(__dirname, 'converter');
    let app: Application;

    before('constructs', function() {
        app = new Application({
            mode: 'Modules',
            logger: 'none',
            target: 'ES5',
            module: 'CommonJS',
            experimentalDecorators: true,
            categorizeByGroup: false,
            jsx: 'react',
            name: 'typedoc'
        });
    });

    // verify that no categories are used when not specified during lump categorization
    // this is in a separate `describe` block since it uses specs.json even though it is a categorize test.
    describe('class', () => {
        let result: ProjectReflection | undefined;
        const classDir = Path.join(base, 'class');

        it('converts fixtures', function() {
            resetReflectionID();
            result = app.convert(app.expandInputFiles([classDir]));
            Assert(result instanceof ProjectReflection, 'No reflection returned');
        });

        it('matches specs', function() {
            const specs = JSON.parse(FS.readFileSync(Path.join(classDir, 'specs.json')).toString());
            Assert.deepStrictEqual(normalizeSerialized(result!.toObject()), specs);
        });
    });
});
