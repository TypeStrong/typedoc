"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const minimatch_1 = require("minimatch");
const unix = Path.sep === '/';
function createMinimatch(patterns) {
    return patterns.map((pattern) => {
        if (unix) {
            pattern = pattern.replace(/[\\]/g, '/').replace(/^\w:/, '');
        }
        if (pattern.substr(0, 2) !== '**') {
            pattern = Path.resolve(pattern);
        }
        if (!unix) {
            pattern = pattern.replace(/[\\]/g, '/');
        }
        return new minimatch_1.Minimatch(pattern, { dot: true });
    });
}
exports.createMinimatch = createMinimatch;
//# sourceMappingURL=paths.js.map