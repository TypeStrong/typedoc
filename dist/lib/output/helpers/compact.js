"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compact(options) {
    var lines = options.fn(this).split('\n');
    for (var i = 0, c = lines.length; i < c; i++) {
        lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
    }
    return lines.join('');
}
exports.compact = compact;
//# sourceMappingURL=compact.js.map