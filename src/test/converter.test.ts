import { Application, resetReflectionID, normalizePath, ProjectReflection } from '..';
import * as FS from 'fs';
import * as Path from 'path';
import { deepStrictEqual as equal, ok } from 'assert';
import { ScriptTarget, ModuleKind, JsxEmit } from 'typescript';

import json = require('./converter/class/specs.json');
import { JSONOutput } from '../lib/serialization';

describe('Converter', function() {
    const base = Path.join(__dirname, 'converter');
    const app = new Application();
    app.bootstrap({
        mode: 'modules',
        logger: 'none',
        target: ScriptTarget.ES5,
        module: ModuleKind.CommonJS,
        experimentalDecorators: true,
        jsx: JsxEmit.React,
        name: 'typedoc',
        ignoreCompilerErrors: true,
        excludeExternals: true
    });

    const checks: [string, () => void, () => void][] = [
        ['specs', () => { }, () => { }],
        ['specs.d',
            () => app.options.setValue('includeDeclarations', true).unwrap(),
            () => app.options.setValue('includeDeclarations', false).unwrap()
        ],
        ['specs-without-exported',
            () => app.options.setValue('excludeNotExported', true).unwrap(),
            () => app.options.setValue('excludeNotExported', false).unwrap()
        ],
        ['specs-with-lump-categories',
            () => app.options.setValue('categorizeByGroup', false).unwrap(),
            () => app.options.setValue('categorizeByGroup', true).unwrap()
        ],
        ['specs.lib',
            () => app.options.setValue('mode', 'library').unwrap(),
            () => app.options.setValue('mode', 'modules').unwrap()
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

describe('Serializer', () => {
    it('Type checks', () => {
        const typed: JSONOutput.ProjectReflection = json;
        equal(json, typed);
    });
});
