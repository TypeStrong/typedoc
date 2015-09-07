var Path = require("path");
var FS = require("fs");
exports.typescriptPath = (function () {
    var path = Path.dirname(require.resolve('typescript'));
    if (!FS.existsSync(Path.resolve(path, 'tsc.js'))) {
        process.stderr.write('Could not find ´tsc.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
        process.exit();
    }
    else {
        return path;
    }
})();
exports.typescriptVersion = (function () {
    var json = JSON.parse(FS.readFileSync(Path.join(exports.typescriptPath, '..', 'package.json'), 'utf8'));
    return json.version;
})();
exports.typescript = eval((function () {
    var fileName = Path.resolve(exports.typescriptPath, 'tsc.js');
    var contents = FS.readFileSync(fileName, 'utf-8');
    return contents.replace('ts.executeCommandLine(ts.sys.args);', '');
})());
