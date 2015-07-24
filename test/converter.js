var TypeDoc = require("../bin/typedoc.js");
var FS      = require('fs');
var Path    = require('path');
var Assert  = require("assert");


function compareReflections(fixture, spec, path) {
    var key;
    path = (path ? path + '/' : '') + spec.name;

    for (key in spec) {
        if (!spec.hasOwnProperty(key)) continue;
        Assert(fixture.hasOwnProperty(key), path + ': Missing property "' + key + '"');
    }

    for (key in fixture) {
        if (!fixture.hasOwnProperty(key) || typeof fixture[key] == 'undefined') continue;
        Assert(spec.hasOwnProperty(key), path + ': Unknown property "' + key + '"');

        var a = fixture[key];
        var b = spec[key];
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
    var a = fixture.map(function(child) { return child.id; });
    var b = spec.map(function(child) { return child.id; });

    Assert(a.length == b.length, path + ': Number of children differs');
    Assert(a.every(function(u, i) { return u === b[i]; }), path + ': Children are different');

    fixture.forEach(function(a, index) {
        compareReflections(a, spec[index], path);
    });
}


describe('Converter', function() {
    var base = Path.join(__dirname, 'converter');
    var app;

    it('constructs', function() {
        app = new TypeDoc.Application({
            mode:   'Modules',
            logger: 'none',
            target: 'ES5',
            module: 'CommonJS',
            noLib:  true,
            experimentalDecorators: true
        });
    });

    FS.readdirSync(base).forEach(function (directory) {
        var path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) return;

        describe(directory, function() {
            var result;

            it('converts fixtures', function() {
                TypeDoc.models.resetReflectionID();
                result = app.convert(app.expandInputFiles([path]));
                Assert(result instanceof TypeDoc.models.ProjectReflection, 'No reflection returned');
            });

            it('matches specs', function() {
                var specs = JSON.parse(FS.readFileSync(Path.join(path, 'specs.json')));
                var data = JSON.stringify(result.toObject(), null, '  ');
                data = data.split(TypeDoc.normalizePath(base)).join('%BASE%');

                compareReflections(JSON.parse(data), specs);
            });
        });
    });
});
