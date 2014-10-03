/// <reference path="lib/tsd.d.ts" />

declare module TypeScript {
    var typescriptPath:string;
}

var Handlebars:HandlebarsStatic = require('handlebars');
var Marked:MarkedStatic = require('marked');
var HighlightJS = require('highlight.js');
var Minimatch = require('minimatch');
var Util = require('util');
var VM = require('vm');
var Path = require('path');
var FS = require('fs-extra');
var ShellJS = require('shelljs');

var typeScriptPath = Path.dirname(require.resolve('typescript'));
if (!FS.existsSync(Path.resolve(typeScriptPath, 'typescript.js'))) {
    process.stderr.write('Could not find ´typescript.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
    process.exit();
}

eval(FS.readFileSync(Path.resolve(typeScriptPath, 'typescript.js'), 'utf-8'));