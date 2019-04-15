"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const FS = require("fs");
const path_1 = require("path");
const existingDirectories = {};
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}
exports.normalizePath = normalizePath;
function directoryExists(directoryPath) {
    if (existingDirectories.hasOwnProperty(directoryPath)) {
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
    if (!directoryExists(directoryPath)) {
        const parentDirectory = path_1.dirname(directoryPath);
        ensureDirectoriesExist(parentDirectory);
        ts.sys.createDirectory(directoryPath);
    }
}
exports.ensureDirectoriesExist = ensureDirectoriesExist;
function writeFile(fileName, data, writeByteOrderMark, onError) {
    try {
        ensureDirectoriesExist(path_1.dirname(normalizePath(fileName)));
        ts.sys.writeFile(fileName, data, writeByteOrderMark);
    }
    catch (e) {
        if (onError) {
            onError(e.message);
        }
    }
}
exports.writeFile = writeFile;
function readFile(file) {
    const buffer = FS.readFileSync(file);
    switch (buffer[0]) {
        case 0xFE:
            if (buffer[1] === 0xFF) {
                let i = 0;
                while ((i + 1) < buffer.length) {
                    const temp = buffer[i];
                    buffer[i] = buffer[i + 1];
                    buffer[i + 1] = temp;
                    i += 2;
                }
                return buffer.toString('ucs2', 2);
            }
            break;
        case 0xFF:
            if (buffer[1] === 0xFE) {
                return buffer.toString('ucs2', 2);
            }
            break;
        case 0xEF:
            if (buffer[1] === 0xBB) {
                return buffer.toString('utf8', 3);
            }
    }
    return buffer.toString('utf8', 0);
}
exports.readFile = readFile;
//# sourceMappingURL=fs.js.map