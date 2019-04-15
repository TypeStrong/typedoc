"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function wbr(options) {
    let str = typeof options === 'string' ? options : options.fn(this);
    str = str.replace(/([^_\-][_\-])([^_\-])/g, (m, a, b) => a + '<wbr>' + b);
    str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, (m, a, b) => a + '<wbr>' + b);
    return str;
}
exports.wbr = wbr;
//# sourceMappingURL=wbr.js.map