/// <reference path="../lib/fs.extra/fs.extra.d.ts" />
/// <reference path="../lib/handlebars/handlebars.d.ts" />
/// <reference path="../lib/highlight.js/highlight.js.d.ts" />
/// <reference path="../lib/marked/marked.d.ts" />
/// <reference path="../lib/minimatch/minimatch.d.ts" />
/// <reference path="../lib/node/node.d.ts" />
/// <reference path="../lib/typescript/typescript.d.ts" />

declare module TypeScript {
    var typescriptPath:string;
}

var Handlebars  = require('handlebars');
var Marked      = require('marked');
var HighlightJS = require('highlight.js');
var Minimatch   = require('minimatch');
var VM          = require('vm');
var Path        = require('path');
var FS          = require('fs.extra');

var dirname = Path.dirname(require.resolve('typescript'));
var file = Path.resolve(dirname, 'typescript.js');
if (!file) {
    process.stderr.write('Could not find ´typescript.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
    process.exit();
}


eval(FS.readFileSync(file, 'utf-8'));

TypeScript.typescriptPath = dirname;