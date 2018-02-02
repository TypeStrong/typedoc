import { Application, resetReflectionID, normalizePath, ProjectReflection } from '..';
import * as FS from 'fs';
import * as Path from 'path';
import Assert = require('assert');

function compareReflections(fixture, spec, path?: string) {
    path = (path ? path + '/' : '') + spec.name;
    Assert.deepEqual(fixture, spec);

    for (let key in spec) {
        if (!spec.hasOwnProperty(key)) {
            continue;
        }
        Assert(fixture.hasOwnProperty(key), path + ': Missing property "' + key + '"');
    }

    for (let key in fixture) {
        if (!fixture.hasOwnProperty(key) || typeof fixture[key] === 'undefined') {
            continue;
        }
        Assert(spec.hasOwnProperty(key), path + ': Unknown property "' + key + '"');

        const a = fixture[key];
        const b = spec[key];
        Assert(a instanceof Object === b instanceof Object, path + ': Property "' + key + '" type mismatch');

        if (a instanceof Object) {
            switch (key) {
                case 'signatures':
                case 'typeParameters':
                case 'children':
                    compareChildren(a, b, path);
                    break;
                case 'indexSignature':
                case 'getSignature':
                case 'setSignature':
                    compareReflections(a, b, path);
                    break;
                default:
                    Assert.deepEqual(a, b, path + ': Property "' + key + '" value mismatch');
            }
        } else {
            Assert(a === b, path + ': Property "' + key + '" value mismatch');
        }
    }
}

function compareChildren(fixture, spec, path) {
    const a = fixture.map(function(child) { return child.id; });
    const b = spec.map(function(child) { return child.id; });

    Assert(a.length === b.length, path + ': Number of children differs');
    Assert(a.every(function(u, i) { return u === b[i]; }), path + ': Children are different');

    fixture.forEach(function(a, index) {
        compareReflections(a, spec[index], path);
    });
}

describe('Converter', function() {
    const base = Path.join(__dirname, 'converter');
    let app: Application;

    it('constructs', function() {
        app = new Application({
            mode:   'Modules',
            logger: 'none',
            target: 'ES5',
            module: 'CommonJS',
            experimentalDecorators: true,
            jsx: 'react'
        });
    });

    FS.readdirSync(base).forEach(function (directory) {
        const path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) {
            return;
        }

        describe(directory, function() {
            let result: ProjectReflection;

            it('converts fixtures', function() {
                resetReflectionID();
                result = app.convert(app.expandInputFiles([path]));
                Assert(result instanceof ProjectReflection, 'No reflection returned');
            });

            it('matches specs', function() {
                const specs = JSON.parse(FS.readFileSync(Path.join(path, 'specs.json')).toString());
                let data = JSON.stringify(result.toObject(), null, '  ');
                data = data.split(normalizePath(base)).join('%BASE%');

                compareReflections(JSON.parse(data), specs);
            });
        });
    });
});

describe('Converter with excludeNotExported=true', function() {
    const base = Path.join(__dirname, 'converter');
    const path = Path.join(base, 'export-with-local');
    let app: Application;

    it('constructs', function() {
        app = new Application({
            mode:   'Modules',
            logger: 'none',
            target: 'ES5',
            module: 'CommonJS',
            experimentalDecorators: true,
            excludeNotExported: true,
            jsx: 'react'
        });
    });

    let result: ProjectReflection;

    it('converts fixtures', function() {
        resetReflectionID();
        result = app.convert(app.expandInputFiles([path]));
        Assert(result instanceof ProjectReflection, 'No reflection returned');
    });

    it('matches specs', function() {
        const specs = JSON.parse(FS.readFileSync(Path.join(path, 'specs-without-exported.json')).toString());
        let data = JSON.stringify(result.toObject(), null, '  ');
        data = data.split(normalizePath(base)).join('%BASE%');

        compareReflections(JSON.parse(data), specs);
    });
});
