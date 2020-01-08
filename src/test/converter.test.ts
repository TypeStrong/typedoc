import { Application, resetReflectionID, normalizePath, ProjectReflection } from '..';
import * as FS from 'fs';
import * as Path from 'path';
import { deepStrictEqual as equal, ok } from 'assert';
import { JsxEmit, ModuleKind, ScriptTarget } from 'typescript';

describe('Converter', function() {
    const base = Path.join(__dirname, 'converter');
    let app: Application;

    before('constructs', function() {
        app = new Application({
            mode:   'Modules',
            logger: 'none',
            target: ScriptTarget.ES5,
            module: ModuleKind.CommonJS,
            experimentalDecorators: true,
            jsx: JsxEmit.React,
            name: 'typedoc',
            ignoreCompilerErrors: true
        });
    });

    FS.readdirSync(base).forEach(function (directory) {
        const path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) {
            return;
        }

        describe(directory, function() {
            let result: ProjectReflection | undefined;

            it('converts fixtures', function() {
                resetReflectionID();
                result = app.convert(app.expandInputFiles([path]));
                ok(result instanceof ProjectReflection, 'No reflection returned');
            });

            it('matches specs', function() {
                const specs = JSON.parse(FS.readFileSync(Path.join(path, 'specs.json')).toString());
                let data = JSON.stringify(app.serializer.toObject(result), null, '  ');
                data = data.split(normalizePath(base)).join('%BASE%');

                equal(JSON.parse(data), specs);
            });
        });
    });
});

describe('Converter with categorizeByGroup=false', function() {
    const base = Path.join(__dirname, 'converter');
    const categoryDir = Path.join(base, 'category');
    const classDir = Path.join(base, 'class');
    let app: Application;

    before('constructs', function() {
        app = new Application({
            mode: 'Modules',
            logger: 'none',
            target: ScriptTarget.ES5,
            module: ModuleKind.CommonJS,
            experimentalDecorators: true,
            categorizeByGroup: false,
            jsx: JsxEmit.React,
            name: 'typedoc',
            ignoreCompilerErrors: true
        });
    });

    let result: ProjectReflection | undefined;

    describe('category', () => {
        it('converts fixtures', function() {
            resetReflectionID();
            result = app.convert(app.expandInputFiles([categoryDir]));
            ok(result instanceof ProjectReflection, 'No reflection returned');
        });

        it('matches specs', function() {
            const specs = JSON.parse(FS.readFileSync(Path.join(categoryDir, 'specs-with-lump-categories.json')).toString());
            let data = JSON.stringify(result!.toObject(), null, '  ');
            data = data.split(normalizePath(base)).join('%BASE%');

            equal(JSON.parse(data), specs);
        });
    });

    // verify that no categories are used when not specified during lump categorization
    describe('class', () => {
        it('converts fixtures', function() {
            resetReflectionID();
            result = app.convert(app.expandInputFiles([classDir]));
            ok(result instanceof ProjectReflection, 'No reflection returned');
        });

        it('matches specs', function() {
            const specs = JSON.parse(FS.readFileSync(Path.join(classDir, 'specs.json')).toString());
            let data = JSON.stringify(result!.toObject(), null, '  ');
            data = data.split(normalizePath(base)).join('%BASE%');

            equal(JSON.parse(data), specs);
        });
    });
});

describe('Converter with excludeNotExported=true', function() {
    const base = Path.join(__dirname, 'converter');
    const exportWithLocalDir = Path.join(base, 'export-with-local');
    const classDir = Path.join(base, 'class');
    let app: Application;

    before('constructs', function() {
        app = new Application({
            mode: 'Modules',
            logger: 'none',
            target: ScriptTarget.ES5,
            module: ModuleKind.CommonJS,
            experimentalDecorators: true,
            excludeNotExported: true,
            jsx: JsxEmit.React,
            name: 'typedoc',
            ignoreCompilerErrors: true
        });
    });

    let result: ProjectReflection | undefined;

    describe('export-with-local', () => {
        it('converts fixtures', function() {
            resetReflectionID();
            result = app.convert(app.expandInputFiles([exportWithLocalDir]));
            ok(result instanceof ProjectReflection, 'No reflection returned');
        });

        it('matches specs', function() {
            const specs = JSON.parse(FS.readFileSync(Path.join(exportWithLocalDir, 'specs-without-exported.json')).toString());
            let data = JSON.stringify(result!.toObject(), null, '  ');
            data = data.split(normalizePath(base)).join('%BASE%');

            equal(JSON.parse(data), specs);
        });
    });

    describe('class', () => {
        it('converts fixtures', function() {
            resetReflectionID();
            result = app.convert(app.expandInputFiles([classDir]));
            ok(result instanceof ProjectReflection, 'No reflection returned');
        });

        it('matches specs', function() {
            const specs = JSON.parse(FS.readFileSync(Path.join(classDir, 'specs-without-exported.json')).toString());
            let data = JSON.stringify(result!.toObject(), null, '  ');
            data = data.split(normalizePath(base)).join('%BASE%');

            equal(JSON.parse(data), specs);
        });
    });

});
