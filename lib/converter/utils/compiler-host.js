"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Path = require("path");
var components_1 = require("../components");
var ERROR_UNSUPPORTED_FILE_ENCODING = -2147024809;
var CompilerHost = (function (_super) {
    __extends(CompilerHost, _super);
    function CompilerHost() {
        _super.apply(this, arguments);
    }
    CompilerHost.prototype.getSourceFile = function (filename, languageVersion, onError) {
        try {
            var text = ts.sys.readFile(filename, this.application.options.getCompilerOptions().charset);
        }
        catch (e) {
            if (onError) {
                onError(e.number === ERROR_UNSUPPORTED_FILE_ENCODING ? 'Unsupported file encoding' : e.message);
            }
            text = "";
        }
        return text !== undefined ? ts.createSourceFile(filename, text, languageVersion) : undefined;
    };
    CompilerHost.prototype.getDefaultLibFileName = function (options) {
        var lib = this.owner.getDefaultLib();
        var path = ts.getDirectoryPath(ts.normalizePath(require.resolve('typescript')));
        return Path.join(path, lib);
    };
    CompilerHost.prototype.getDirectories = function (path) {
        return ts.sys.getDirectories(path);
    };
    CompilerHost.prototype.getCurrentDirectory = function () {
        return this.currentDirectory || (this.currentDirectory = ts.sys.getCurrentDirectory());
    };
    CompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return ts.sys.useCaseSensitiveFileNames;
    };
    CompilerHost.prototype.fileExists = function (fileName) {
        return ts.sys.fileExists(fileName);
    };
    CompilerHost.prototype.readFile = function (fileName) {
        return ts.sys.readFile(fileName);
    };
    CompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
    };
    CompilerHost.prototype.getNewLine = function () {
        return ts.sys.newLine;
    };
    CompilerHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) { };
    return CompilerHost;
}(components_1.ConverterComponent));
exports.CompilerHost = CompilerHost;
//# sourceMappingURL=compiler-host.js.map