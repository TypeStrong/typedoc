"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
class SourceFile {
    constructor(fullFileName) {
        this.reflections = [];
        this.fileName = fullFileName;
        this.fullFileName = fullFileName;
        this.name = Path.basename(fullFileName);
    }
}
exports.SourceFile = SourceFile;
//# sourceMappingURL=file.js.map