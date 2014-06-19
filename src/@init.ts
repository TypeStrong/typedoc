/// <reference path="lib/fs-extra/fs-extra.d.ts" />
/// <reference path="lib/handlebars/handlebars.d.ts" />
/// <reference path="lib/highlight.js/highlight.js.d.ts" />
/// <reference path="lib/marked/marked.d.ts" />
/// <reference path="lib/minimatch/minimatch.d.ts" />
/// <reference path="lib/node/node.d.ts" />
/// <reference path="lib/typescript/typescript.d.ts" />

declare module TypeScript {
    var typescriptPath:string;
}

var Handlebars  = require('handlebars');
var Marked      = require('marked');
var HighlightJS = require('highlight.js');
var Minimatch   = require('minimatch');
var Util        = require('util');
var VM          = require('vm');
var Path        = require('path');
var FS          = require('fs-extra');

var typeScriptPath = Path.dirname(require.resolve('typescript'));
if (!FS.existsSync(Path.resolve(typeScriptPath, 'typescript.js'))) {
    process.stderr.write('Could not find ´typescript.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
    process.exit();
}

eval(FS.readFileSync(Path.resolve(typeScriptPath, 'typescript.js'), 'utf-8'));