"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compact(options) {
    const lines = options.fn(this).split('\n');
    for (let i = 0, c = lines.length; i < c; i++) {
        lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
    }
    return lines.join('');
}
exports.compact = compact;
//# sourceMappingURL=compact.js.map