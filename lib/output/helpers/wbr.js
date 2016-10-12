"use strict";
function wbr(options) {
    var str = typeof options == 'string' ? options : options.fn(this);
    str = str.replace(/([^_\-][_\-])([^_\-])/g, function (m, a, b) { return a + '<wbr>' + b; });
    str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, function (m, a, b) { return a + '<wbr>' + b; });
    return str;
}
exports.wbr = wbr;
//# sourceMappingURL=wbr.js.map