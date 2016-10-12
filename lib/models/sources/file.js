"use strict";
var Path = require("path");
var SourceFile = (function () {
    function SourceFile(fullFileName) {
        this.reflections = [];
        this.fileName = fullFileName;
        this.fullFileName = fullFileName;
        this.name = Path.basename(fullFileName);
    }
    return SourceFile;
}());
exports.SourceFile = SourceFile;
//# sourceMappingURL=file.js.map