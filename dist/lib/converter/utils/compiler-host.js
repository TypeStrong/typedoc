"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ts = require("../../ts-internal");
var components_1 = require("../components");
var ERROR_UNSUPPORTED_FILE_ENCODING = -2147024809;
var CompilerHost = (function (_super) {
    __extends(CompilerHost, _super);
    function CompilerHost() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CompilerHost.prototype.getSourceFile = function (filename, languageVersion, onError) {
        var text;
        try {
            text = ts.sys.readFile(filename, this.application.options.getCompilerOptions().charset);
        }
        catch (e) {
            if (onError) {
                onError(e.number === ERROR_UNSUPPORTED_FILE_ENCODING ? 'Unsupported file encoding' : e.message);
            }
            text = '';
        }
        return text !== undefined ? ts.createSourceFile(filename, text, languageVersion) : undefined;
    };
    CompilerHost.prototype.getDefaultLibFileName = function (options) {
        var libLocation = _ts.getDirectoryPath(_ts.normalizePath(ts.sys.getExecutingFilePath()));
        return _ts.combinePaths(libLocation, ts.getDefaultLibFileName(options));
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
    CompilerHost.prototype.directoryExists = function (directoryName) {
        return ts.sys.directoryExists(directoryName);
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