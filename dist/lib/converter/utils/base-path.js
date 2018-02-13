"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var BasePath = (function () {
    function BasePath() {
        this.basePaths = [];
    }
    BasePath.prototype.add = function (fileName) {
        var fileDir = Path.dirname(BasePath.normalize(fileName));
        var filePath = fileDir.split('/');
        basePaths: for (var n = 0, c = this.basePaths.length; n < c; n++) {
            var basePath = this.basePaths[n].split('/');
            var mMax = Math.min(basePath.length, filePath.length);
            for (var m = 0; m < mMax; m++) {
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
    };
    BasePath.prototype.trim = function (fileName) {
        fileName = BasePath.normalize(fileName);
        for (var n = 0, c = this.basePaths.length; n < c; n++) {
            var basePath = this.basePaths[n];
            if (fileName.substr(0, basePath.length) === basePath) {
                return fileName.substr(basePath.length + 1);
            }
        }
        return fileName;
    };
    BasePath.prototype.reset = function () {
        this.basePaths = [];
    };
    BasePath.normalize = function (path) {
        path = path.replace(/\\/g, '/');
        path = path.replace(/^["']+|["']+$/g, '');
        return path.replace(/^([^\:]+)\:\//, function (m, m1) { return m1.toUpperCase() + ':/'; });
    };
    return BasePath;
}());
exports.BasePath = BasePath;
//# sourceMappingURL=base-path.js.map