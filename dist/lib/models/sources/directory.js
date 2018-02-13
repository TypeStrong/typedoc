"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SourceDirectory = (function () {
    function SourceDirectory(name, parent) {
        this.parent = null;
        this.directories = {};
        this.files = [];
        this.name = null;
        this.dirName = null;
        if (name && parent) {
            this.name = name;
            this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
            this.parent = parent;
        }
    }
    SourceDirectory.prototype.toString = function (indent) {
        if (indent === void 0) { indent = ''; }
        var res = indent + this.name;
        for (var key in this.directories) {
            if (!this.directories.hasOwnProperty(key)) {
                continue;
            }
            res += '\n' + this.directories[key].toString(indent + '  ');
        }
        this.files.forEach(function (file) {
            res += '\n' + indent + '  ' + file.fileName;
        });
        return res;
    };
    SourceDirectory.prototype.getAllReflections = function () {
        var reflections = [];
        this.files.forEach(function (file) {
            reflections.push.apply(reflections, file.reflections);
        });
        return reflections;
    };
    return SourceDirectory;
}());
exports.SourceDirectory = SourceDirectory;
//# sourceMappingURL=directory.js.map