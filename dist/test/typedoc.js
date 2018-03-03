"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var Path = require("path");
var Assert = require("assert");
describe('TypeDoc', function () {
    var application;
    describe('Application', function () {
        it('constructs', function () {
            application = new __1.Application();
        });
        it('expands input directory', function () {
            var inputFiles = Path.join(__dirname, 'converter', 'class');
            var expanded = application.expandInputFiles([inputFiles]);
            Assert.notEqual(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('expands input files', function () {
            var inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            var expanded = application.expandInputFiles([inputFiles]);
            Assert.notEqual(expanded.indexOf(inputFiles), -1);
        });
        it('honors the exclude argument even on a fixed directory list', function () {
            var inputFiles = Path.join(__dirname, 'converter', 'class');
            application.options.setValue('exclude', '**/class.ts');
            var expanded = application.expandInputFiles([inputFiles]);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('honors the exclude argument even on a fixed file list', function () {
            var inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            application.options.setValue('exclude', '**/class.ts');
            var expanded = application.expandInputFiles([inputFiles]);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('supports multiple excludes', function () {
            var inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', '**/+(class|access).ts');
            var expanded = application.expandInputFiles([inputFiles]);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class', 'class.ts')), -1);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'access', 'access.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('supports array of excludes', function () {
            var inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', ['**/class.ts', '**/access.ts']);
            var expanded = application.expandInputFiles([inputFiles]);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class', 'class.ts')), -1);
            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'access', 'access.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
    });
});
//# sourceMappingURL=typedoc.js.map