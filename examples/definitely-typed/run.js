#!/usr/bin/env node

var TypeDoc = require('../../bin/typedoc.js');
var Util    = require('util');
var Path    = require('path');
var FS      = require('fs');

var app = new TypeDoc.Application();
if (app.settings.readFromCommandline(app)) {
    app.settings.theme = Path.resolve('../../bin/themes/default');
    console.log(Path.resolve('../../bin/themes/default'));
    app.settings.inputFiles.forEach(function(path) {
        var stat = FS.statSync(path);
        if (!stat.isDirectory()) {
            app.log(Util.format('%s is not a directory.', path), TypeDoc.LogLevel.Warn);
            return;
        }

        FS.readdirSync(path).forEach(function(moduleName) {
            var modulePath = Path.join(path, moduleName);
            stat = FS.statSync(modulePath);
            if (!stat.isDirectory()) {
                return;
            }

            var definitionFile;
            FS.readdirSync(modulePath).forEach(function(fileName) {
                if (fileName.substr(-5) != '.d.ts') return;
                if (!definitionFile || fileName.length < definitionFile.length) {
                    definitionFile = fileName;
                }
            });

            if (definitionFile) {
                console.log(Util.format('Generating docs for %s', moduleName));
                app.generate(
                    [Path.join(modulePath, definitionFile)],
                    Path.join(app.settings.outputDirectory, moduleName)
                );
            }
        });
    });
}