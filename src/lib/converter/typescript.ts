import * as Path from "path";
import * as FS from "fs";


/*
 * Locate TypeScript
 */
export var typescriptPath:string = (function() {
    var path = Path.dirname(require.resolve('typescript'));
    if (!FS.existsSync(Path.resolve(path, 'tsc.js'))) {
        process.stderr.write('Could not find ´tsc.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
        process.exit();
    } else {
        return path;
    }
})();


/**
 * Return the version number of the loaded TypeScript compiler.
 *
 * @returns The version number of the loaded TypeScript package.
 */
export var typescriptVersion:string = (function() {
    var json = JSON.parse(FS.readFileSync(Path.join(typescriptPath, '..', 'package.json'), 'utf8'));
    return json.version;
})();


/*
 * Load TypeScript
 */
export var typescript:typeof ts = eval((function() {
    var fileName = Path.resolve(typescriptPath, 'tsc.js');
    var contents = FS.readFileSync(fileName, 'utf-8');
    return contents.replace('ts.executeCommandLine(ts.sys.args);', '');
})());
