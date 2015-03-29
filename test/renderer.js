var TypeDoc = require("../bin/typedoc.js");
var FS = require("fs-extra");
var Path    = require("path");
var Assert  = require("assert");


function getFileIndex(base, dir, results) {
    results = results || [];
    dir = dir || '';
    var files = FS.readdirSync(Path.join(base, dir));
    files.forEach(function(file) {
        file = Path.join(dir, file);
        if (FS.statSync(Path.join(base, file)).isDirectory()) {
            getFileIndex(base, file, results);
        } else {
            results.push(file);
        }
    });

    return results.sort();
}


function compareDirectories(a, b) {
    var aFiles = getFileIndex(a);
    var bFiles = getFileIndex(b);
    Assert.deepEqual(aFiles, bFiles, "Generated files differ.");

    var gitHubRegExp = /https:\/\/github.com\/[A-Za-z0-9\-]+\/typedoc\/blob\/[^\/]*\/examples/g;
    aFiles.forEach(function (file) {
        var aSrc = FS.readFileSync(Path.join(a, file), {encoding:'utf-8'})
            .replace("\r", '')
            .replace(gitHubRegExp, '%GITHUB%');
        var bSrc = FS.readFileSync(Path.join(b, file), {encoding:'utf-8'})
            .replace("\r", '')
            .replace(gitHubRegExp, '%GITHUB%');

        if (aSrc != bSrc) {
            var err = new Error('File contents of "' + file + '" differ.');
            err.expected = aSrc;
            err.actual = bSrc;
            err.showDiff = true;
            throw err;
        }
    });
}


describe('Renderer', function() {
    var src = Path.join(__dirname, '..', 'examples', 'basic', 'src');
    var out = Path.join(__dirname, '..', 'tmp', 'test');
    var app, project;

    before(function() {
        FS.removeSync(out);
    });

    after(function(){
        FS.removeSync(out);
    });

    it('constructs', function() {
        app = new TypeDoc.Application({
            mode:   'Modules',
            logger: 'none',
            target: 'ES5',
            module: 'CommonJS',
            noLib:  true
        });
    });

    it('converts basic example', function() {
        this.timeout(0);
        var input = app.expandInputFiles([src]);
        project = app.convert(input);

        Assert(app.logger.errorCount == 0, 'Application.convert returned errors');
        Assert(project instanceof TypeDoc.models.ProjectReflection, 'Application.convert did not return a reflection');
    });

    it('renders basic example', function() {
        this.timeout(0);
        var result = app.generateDocs(project, out);
        Assert(result === true, 'Application.generateDocs returned errors');

        FS.removeSync(Path.join(out, 'assets'));
        compareDirectories(Path.join(__dirname, 'renderer', 'specs'), out);
    });
});
