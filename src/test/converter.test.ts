import { Application, resetReflectionID, normalizePath, ProjectReflection } from '..';
import * as FS from 'fs';
import * as Path from 'path';
import { deepStrictEqual as equal, ok } from 'assert';

describe('Converter', function() {
    const base = Path.join(__dirname, 'converter');
    const app = new Application({
        mode:   'Modules',
        logger: 'none',
        target: 'ES5',
        module: 'CommonJS',
        experimentalDecorators: true,
        jsx: 'react',
        name: 'typedoc',
        ignoreCompilerErrors: true,
        excludeExternals: true
    });

    const checks: [string, () => void, () => void][] = [
        ['specs', () => { }, () => { }],
        ['specs.d',
            () => app.options.setValue('includeDeclarations', true),
            () => app.options.setValue('includeDeclarations', false)
        ],
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
                const specsFile = Path.join(path, `${file}.json`);
                if (!FS.existsSync(specsFile)) {
                    continue;
                }

                let result: ProjectReflection | undefined;

                it(`[${file}] converts fixtures`, function() {
                    before();
                    resetReflectionID();
                    result = app.convert(app.expandInputFiles([path]));
                    after();
                    ok(result instanceof ProjectReflection, 'No reflection returned');
                });

                it(`[${file}] matches specs`, function() {
                    const specs = JSON.parse(FS.readFileSync(specsFile, 'utf-8'));
                    let data = JSON.stringify(app.serializer.toObject(result), null, '  ');
                    data = data.split(normalizePath(base)).join('%BASE%');

                    equal(JSON.parse(data), specs);
                });
            }
        });
    });
});

