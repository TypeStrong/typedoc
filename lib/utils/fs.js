var ts = require("typescript");
var existingDirectories = {};
function normalizePath(path) {
    return ts.normalizePath(path);
}
exports.normalizePath = normalizePath;
function directoryExists(directoryPath) {
    if (ts.hasProperty(existingDirectories, directoryPath)) {
        return true;
    }
    if (ts.sys.directoryExists(directoryPath)) {
        existingDirectories[directoryPath] = true;
        return true;
    }
    return false;
}
exports.directoryExists = directoryExists;
function ensureDirectoriesExist(directoryPath) {
    if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
        var parentDirectory = ts.getDirectoryPath(directoryPath);
        ensureDirectoriesExist(parentDirectory);
        ts.sys.createDirectory(directoryPath);
    }
}
exports.ensureDirectoriesExist = ensureDirectoriesExist;
function writeFile(fileName, data, writeByteOrderMark, onError) {
    try {
        ensureDirectoriesExist(ts.getDirectoryPath(ts.normalizePath(fileName)));
        ts.sys.writeFile(fileName, data, writeByteOrderMark);
    }
    catch (e) {
        if (onError)
            onError(e.message);
    }
}
exports.writeFile = writeFile;
