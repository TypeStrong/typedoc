var TypeDoc = require("../bin/typedoc.js");
var Path    = require("path");
var Assert  = require("assert");

describe('TypeDoc.Factories', function() {
    var dispatcher, project;
    var settings = new TypeDoc.Settings();
    settings.inputFiles = [Path.join(__dirname, 'fixtures', 'basic')];
    settings.expandInputFiles();
    settings.compiler.noLib = true;
    settings.compiler.moduleGenTarget = 1;

    var application = {
        settings: settings,
        log: function(message, level) {}
    };

    describe('Dispatcher', function() {
        it('constructs', function() {
            dispatcher = new TypeDoc.Factories.Dispatcher(application);
        });
        it('creates projects', function() {
            project = dispatcher.createProject(application.settings.inputFiles);
        });
    });

    describe('Reflections', function() {
        var classesModule;

        describe('Dynamic module reflections', function() {
            it('detects dynamic modules', function() {
                classesModule = project.getChildByName('"classes"');
                Assert.equal(classesModule instanceof TypeDoc.Models.BaseReflection, true);
                Assert.equal(classesModule.kind, TypeDoc.Models.Kind.DynamicModule);
            });
        });

        describe('Class reflections', function() {
            var testClass;

            it('detects classes', function() {
                testClass = classesModule.getChildByName('TestClass');
                Assert.equal(testClass instanceof TypeDoc.Models.BaseReflection, true);
                Assert.equal(testClass.kind, TypeDoc.Models.Kind.Class);
            });
        });
    });
});