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
        it('reflects classes', function() {
            var dynamicModuleReflection = project.getChildByName('"classes"');
            Assert.equal(dynamicModuleReflection instanceof TypeDoc.Models.BaseReflection, true);
            Assert.equal(dynamicModuleReflection.kind, TypeDoc.Models.Kind.DynamicModule);

            var classReflection = dynamicModuleReflection.getChildByName('TestClass');
            Assert.equal(classReflection instanceof TypeDoc.Models.BaseReflection, true);
            Assert.equal(classReflection.kind, TypeDoc.Models.Kind.Class);
        });
    });
});