"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SourceDirectory {
    constructor(name, parent) {
        this.directories = {};
        this.files = [];
        if (name && parent) {
            this.name = name;
            this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
            this.parent = parent;
        }
    }
    toString(indent = '') {
        let res = indent + this.name;
        for (let key in this.directories) {
            if (!this.directories.hasOwnProperty(key)) {
                continue;
            }
            res += '\n' + this.directories[key].toString(indent + '  ');
        }
        this.files.forEach((file) => {
            res += '\n' + indent + '  ' + file.fileName;
        });
        return res;
    }
    getAllReflections() {
        const reflections = [];
        this.files.forEach((file) => {
            reflections.push.apply(reflections, file.reflections);
        });
        return reflections;
    }
}
exports.SourceDirectory = SourceDirectory;
//# sourceMappingURL=directory.js.map