"use strict";
var ts = require("typescript");
var FS = require("fs");
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
function readFile(file) {
    var buffer = FS.readFileSync(file);
    switch (buffer[0]) {
        case 0xFE:
            if (buffer[1] === 0xFF) {
                var i = 0;
                while ((i + 1) < buffer.length) {
                    var temp = buffer[i];
                    buffer[i] = buffer[i + 1];
                    buffer[i + 1] = temp;
                    i += 2;
                }
                return buffer.toString("ucs2", 2);
            }
            break;
        case 0xFF:
            if (buffer[1] === 0xFE) {
                return buffer.toString("ucs2", 2);
            }
            break;
        case 0xEF:
            if (buffer[1] === 0xBB) {
                return buffer.toString("utf8", 3);
            }
    }
    return buffer.toString("utf8", 0);
}
exports.readFile = readFile;
//# sourceMappingURL=fs.js.map