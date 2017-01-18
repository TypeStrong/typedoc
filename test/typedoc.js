var TypeDoc = require("../");
var Path    = require("path");
var Assert  = require("assert");

describe('TypeDoc', function() {
    var application, parser;

    describe('Application', function() {
        it('constructs', function() {
            application = new TypeDoc.Application();
        });
        it('expands input files', function() {
            var inputFiles = Path.join(__dirname, 'converter', 'class');
            var expanded = application.expandInputFiles([inputFiles]);

            Assert.notEqual(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
        it('honors the exclude argument even on a fixed file list', function() {
            var inputFiles = Path.join(__dirname, 'converter', 'class');
            application.options.setValue('exclude', '**/class.ts');
            var expanded = application.expandInputFiles([inputFiles]);

            Assert.equal(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
    });
});
