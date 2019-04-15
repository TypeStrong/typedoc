"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
class BasePath {
    constructor() {
        this.basePaths = [];
    }
    add(fileName) {
        const fileDir = Path.dirname(BasePath.normalize(fileName));
        const filePath = fileDir.split('/');
        basePaths: for (let n = 0, c = this.basePaths.length; n < c; n++) {
            const basePath = this.basePaths[n].split('/');
            const mMax = Math.min(basePath.length, filePath.length);
            for (let m = 0; m < mMax; m++) {
                if (basePath[m] === filePath[m]) {
                    continue;
                }
                if (m < 1) {
                    continue basePaths;
                }
                else {
                    if (m < basePath.length) {
                        this.basePaths[n] = basePath.slice(0, m).join('/');
                    }
                    return;
                }
            }
            this.basePaths[n] = basePath.splice(0, mMax).join('/');
            return;
        }
        this.basePaths.push(fileDir);
    }
    trim(fileName) {
        fileName = BasePath.normalize(fileName);
        for (let n = 0, c = this.basePaths.length; n < c; n++) {
            const basePath = this.basePaths[n];
            if (fileName.substr(0, basePath.length) === basePath) {
                return fileName.substr(basePath.length + 1);
            }
        }
        return fileName;
    }
    reset() {
        this.basePaths = [];
    }
    static normalize(path) {
        path = path.replace(/\\/g, '/');
        path = path.replace(/^["']+|["']+$/g, '');
        return path.replace(/^([^\:]+)\:\//, (m, m1) => m1.toUpperCase() + ':/');
    }
}
exports.BasePath = BasePath;
//# sourceMappingURL=base-path.js.map