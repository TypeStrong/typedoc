var TypeDoc = require("../index.js");
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
    });
});
