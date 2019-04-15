"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const Path = require("path");
const Assert = require("assert");
require("./.dot");
const converter_1 = require("../lib/converter");
describe('TypeDoc', function () {
    let application;
    describe('Application', function () {
        before('constructs', function () {
            application = new __1.Application();
        });
        it('expands input directory', function () {
            const inputFiles = Path.join(__dirname, 'converter', 'class');
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(expanded.includes(Path.join(inputFiles, 'class.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('expands input files', function () {
            const inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(expanded.includes(inputFiles));
        });
        it('honors the exclude argument even on a fixed directory list', function () {
            const inputFiles = Path.join(__dirname, 'converter', 'class');
            application.options.setValue('exclude', '**/class.ts');
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(!expanded.includes(Path.join(inputFiles, 'class.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('honors the exclude argument even on a fixed file list', function () {
            const inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            application.options.setValue('exclude', '**/class.ts');
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(!expanded.includes(inputFiles));
        });
        it('supports multiple excludes', function () {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', '**/+(class|access).ts');
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(!expanded.includes(Path.join(inputFiles, 'class', 'class.ts')));
            Assert(!expanded.includes(Path.join(inputFiles, 'access', 'access.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('supports array of excludes', function () {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', ['**/class.ts', '**/access.ts']);
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(!expanded.includes(Path.join(inputFiles, 'class', 'class.ts')));
            Assert(!expanded.includes(Path.join(inputFiles, 'access', 'access.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('supports excluding directories beginning with dots', function () {
            const inputFiles = __dirname;
            application.options.setValue('exclude', '**/+(.dot)/**');
            const expanded = application.expandInputFiles([inputFiles]);
            Assert(!expanded.includes(Path.join(inputFiles, '.dot', 'index.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('Honors the exclude option even if a module is imported', () => {
            application.options.setValue('exclude', '**/b.d.ts');
            function handler(context) {
                Assert.deepStrictEqual(context.fileNames, [
                    Path.resolve(__dirname, 'module', 'a.d.ts').replace(/\\/g, '/')
                ]);
            }
            application.converter.on(converter_1.Converter.EVENT_END, handler);
            application.convert([Path.join(__dirname, 'module', 'a.d.ts')]);
            application.converter.off(converter_1.Converter.EVENT_END, handler);
        });
    });
});
//# sourceMappingURL=typedoc.test.js.map