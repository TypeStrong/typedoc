var TypeDoc = require("../bin/typedoc.js");
var Path    = require("path");
var Assert  = require("assert");

describe('TypeDoc.Factories', function() {
    var dispatcher, project;
    var classesModule, enumsModule, functionsModule;
    var testFunction, testEnum, testClass;

    describe('Dispatcher', function() {
        var settings = new TypeDoc.Settings();
        settings.inputFiles = [Path.join(__dirname, 'fixtures', 'basic')];
        settings.expandInputFiles();
        settings.compiler.noLib = true;
        settings.compiler.moduleGenTarget = 1;

        var application = {
            settings: settings,
            log: function(message, level) {}
        };

        it('constructs', function() {
            dispatcher = new TypeDoc.Factories.Dispatcher(application);
        });
        it('creates projects', function() {
            project = dispatcher.createProject(application.settings.inputFiles);
            Assert.equal(project instanceof TypeDoc.Models.ProjectReflection, true);
            Assert.equal(project.children.length, 3);
        });
        it('detects dynamic modules', function() {
            classesModule = project.getChildByName('"classes"');
            Assert.equal(classesModule instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(classesModule.kind, TypeDoc.Models.Kind.DynamicModule);

            enumsModule = project.getChildByName('"enums"');
            Assert.equal(classesModule instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(classesModule.kind, TypeDoc.Models.Kind.DynamicModule);

            functionsModule = project.getChildByName('"functions"');
            Assert.equal(classesModule instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(classesModule.kind, TypeDoc.Models.Kind.DynamicModule);
        });
        it('detects functions', function() {
            testFunction = functionsModule.getChildByName('testFunction');
            Assert.equal(testFunction instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(testFunction.kind, TypeDoc.Models.Kind.Function);
        });
        it('detects enumerations', function() {
            testEnum = enumsModule.getChildByName('TestEnum');
            Assert.equal(testEnum instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(testEnum.kind, TypeDoc.Models.Kind.Enum);
            Assert.equal(testEnum.children.length, 3);
        });
        it('detects classes', function() {
            testClass = classesModule.getChildByName('TestClass');
            Assert.equal(testClass instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(testClass.kind, TypeDoc.Models.Kind.Class);
            Assert.equal(testClass.children.length, 7);
        });
        it('detects class constructors', function() {
            var constructor = testClass.getChildByName('constructor');
            Assert.equal(constructor instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(constructor.kind, TypeDoc.Models.Kind.ConstructorMethod);
            Assert.equal(constructor.isPrivate, false);
            Assert.equal(constructor.isStatic, false);
            Assert.equal(constructor.children.length, 0);
        });
        it('detects public class properties', function() {
            var property = testClass.getChildByName('publicProperty');
            Assert.equal(property instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(property.kind, TypeDoc.Models.Kind.Property);
            Assert.equal(property.isPrivate, false);
            Assert.equal(property.isStatic, false);
            Assert.equal(property.children.length, 0);
        });
        it('detects private class properties', function() {
            var property = testClass.getChildByName('privateProperty');
            Assert.equal(property instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(property.kind, TypeDoc.Models.Kind.Property);
            Assert.equal(property.isPrivate, true);
            Assert.equal(property.isStatic, false);
            Assert.equal(property.children.length, 0);
        });
        it('detects static class properties', function() {
            var property = testClass.getChildByName('staticProperty');
            Assert.equal(property instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(property.kind, TypeDoc.Models.Kind.Property);
            Assert.equal(property.isPrivate, false);
            Assert.equal(property.isStatic, true);
            Assert.equal(property.children.length, 0);
        });
        it('detects public class methods', function() {
            var method = testClass.getChildByName('publicMethod');
            Assert.equal(method instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(method.kind, TypeDoc.Models.Kind.Method);
            Assert.equal(method.isPrivate, false);
            Assert.equal(method.isStatic, false);
            Assert.equal(method.children.length, 0);
        });
        it('detects private class methods', function() {
            var method = testClass.getChildByName('privateMethod');
            Assert.equal(method instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(method.kind, TypeDoc.Models.Kind.Method);
            Assert.equal(method.isPrivate, true);
            Assert.equal(method.isStatic, false);
            Assert.equal(method.children.length, 0);
        });
        it('detects static class methods', function() {
            var method = testClass.getChildByName('staticMethod');
            Assert.equal(method instanceof TypeDoc.Models.DeclarationReflection, true);
            Assert.equal(method.kind, TypeDoc.Models.Kind.Method);
            Assert.equal(method.isPrivate, false);
            Assert.equal(method.isStatic, true);
            Assert.equal(method.children.length, 0);
        });
    });

    describe('CommentHandler', function() {
        it('sets comments', function() {
            Assert.equal(testClass.comment instanceof TypeDoc.Models.Comment, true);
        });
        it('sets comment short texts', function() {
            Assert.equal(testClass.comment.shortText, 'TestClass comment short text.');
        });
        it('sets comment texts', function() {
            Assert.equal(testClass.comment.text, 'TestClass comment\ntext.\n');
        });
        it('sets additional tags', function() {
            var tag = testClass.comment.getTag('see');
            Assert.equal(testClass.comment.tags.length, 1);
            Assert.equal(tag instanceof TypeDoc.Models.CommentTag, true);
            Assert.equal(tag.tagName, 'see');
            Assert.equal(tag.text, '[[TestClass]] @ fixtures\n');
        });
        it('sets returns text', function() {
            Assert.equal(testFunction.comment.returns, "Return comment.\n");
        });
        it('sets parameter comments', function() {
            var param = testFunction.signatures[0].getChildByName('testParam');
            Assert.equal(testFunction.comment.tags.length, 0);
            Assert.equal(param.comment.shortText, 'Test parameter.');
        });
    });

    describe('DynamicModuleHandler', function() {
        it("truncates module names", function() {
            Assert.equal(classesModule.name, '"classes"');
            Assert.equal(enumsModule.name, '"enums"');
        });
    });
});