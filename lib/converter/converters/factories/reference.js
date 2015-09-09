var ReferenceType_1 = require("../../../models/types/ReferenceType");
function createReferenceType(context, symbol, includeParent) {
    var checker = context.checker;
    var id = context.getSymbolID(symbol);
    var name = checker.symbolToString(symbol);
    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + '.' + name;
    }
    return new ReferenceType_1.ReferenceType(name, id);
}
exports.createReferenceType = createReferenceType;
