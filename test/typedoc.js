var TypeDoc = require("../index.js");
var Path    = require("path");
var Assert  = require("assert");

describe('TypeDoc', function() {
    var application, parser;

    describe('Application', function() {
        it('constructs', function() {
            application = new TypeDoc.Application(false);
        });
        it('expands input files', function() {
            var inputFiles = Path.join(__dirname, 'converter', 'class');
            var expanded = application.expandInputFiles([inputFiles]);

            Assert.notEqual(expanded.indexOf(Path.join(inputFiles, 'class.ts')), -1);
            Assert.equal(expanded.indexOf(inputFiles), -1);
        });
    });


    describe('OptionsParser', function() {
        beforeEach(function() {
            application.options = TypeDoc.OptionsParser.createOptions();
            application.compilerOptions = TypeDoc.OptionsParser.createCompilerOptions();
        });

        it('constructs', function() {
            parser = new TypeDoc.OptionsParser(application);
            application.collectParameters(parser);
        });
        it('reads option objects', function() {
            parser.parseObject({
                module:   'commonjs',
                includes: 'inc/',
                media:    'media/',
                target:   'ES5',
                theme:    'default',
                plugin:   ['myPlugin', 'another-plugin'],
                noLib:    true
            });
            Assert.deepEqual(application.options, {
                theme: 'default',
                includes: 'inc/',
                media: 'media/',
                plugin: ['myPlugin', 'another-plugin']
            });
            Assert.deepEqual(application.compilerOptions, {
                module: TypeDoc.ModuleKind.CommonJS,
                target: TypeDoc.ScriptTarget.ES5,
                noLib: true
            });
        });
        it('reads command line arguments', function() {
            parser.addCommandLineParameters();
            parser.parseArguments([
                '--module', 'commonjs',
                '--includes', 'inc/',
                '--media', 'media/',
                '--theme', 'minimal',
                '--target', 'ES5',
                '--noLib',
                '--out', 'doc/',
                '--plugin', 'myPlugin',
                '--plugin', 'another-plugin',
                'src/'
            ]);
            Assert.deepEqual(parser.inputFiles, ['src/']);
            Assert.deepEqual(application.options, {
                theme: 'minimal',
                includes: 'inc/',
                media: 'media/',
                out: 'doc/',
                plugin: ['myPlugin', 'another-plugin']
            });
            Assert.deepEqual(application.compilerOptions, {
                module: TypeDoc.ModuleKind.CommonJS,
                target: TypeDoc.ScriptTarget.ES5,
                noLib: true
            });
        });
    });
});
