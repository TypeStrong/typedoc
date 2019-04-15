"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/types/index");
function createReferenceType(context, symbol, includeParent) {
    if (!symbol) {
        return;
    }
    const checker = context.checker;
    const id = context.getSymbolID(symbol);
    let name = checker.symbolToString(symbol);
    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + '.' + name;
    }
    return new index_1.ReferenceType(name, id);
}
exports.createReferenceType = createReferenceType;
//# sourceMappingURL=reference.js.map