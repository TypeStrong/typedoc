/// <reference path="lib/tsd.d.ts" />

module td
{
    /*
     * Node modules
     */
    export var Util:any = require('util');
    export var VM:any   = require('vm');
    export var Path:any = require('path');


    /*
     * External modules
     */
    export var Handlebars:HandlebarsStatic = require('handlebars');
    export var Marked:MarkedStatic         = require('marked');
    export var HighlightJS:any             = require('highlight.js');
    export var Minimatch:any               = require('minimatch');
    export var FS:any                      = require('fs-extra');
    export var ShellJS:any                 = require('shelljs');
    export var ProgressBar:any             = require('progress');



    /*
     * Locate TypeScript
     */
    export var tsPath:string = (function() {
        var path = Path.dirname(require.resolve('typescript'));
        if (!FS.existsSync(Path.resolve(path, 'tsc.js'))) {
            process.stderr.write('Could not find ´tsc.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
            process.exit();
        } else {
            return path;
        }
    })();
}


/*
 * Load TypeScript
 */
eval((function() {
    var fileName = td.Path.resolve(td.tsPath, 'tsc.js');
    var contents = td.FS.readFileSync(fileName, 'utf-8');
    return contents.replace('ts.executeCommandLine(ts.sys.args);', '');
})());