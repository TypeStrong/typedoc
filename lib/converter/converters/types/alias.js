var ts = require("typescript");
var ReferenceType_1 = require("../../../models/types/ReferenceType");
var AliasConverter = (function () {
    function AliasConverter() {
        this.priority = 100;
    }
    AliasConverter.prototype.supportsNode = function (context, node, type) {
        if (!type || !node || !node.typeName)
            return false;
        if (!type.symbol)
            return true;
        var checker = context.checker;
        var symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
        if (!symbolName.length)
            return false;
        if (symbolName[0].substr(0, 1) == '"')
            symbolName.shift();
        var nodeName = ts.getTextOfNode(node.typeName).split('.');
        if (!nodeName.length)
            return false;
        var common = Math.min(symbolName.length, nodeName.length);
        symbolName = symbolName.slice(-common);
        nodeName = nodeName.slice(-common);
        return nodeName.join('.') != symbolName.join('.');
    };
    AliasConverter.prototype.convertNode = function (context, node) {
        var name = ts.getTextOfNode(node.typeName);
        return new ReferenceType_1.ReferenceType(name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
    };
    return AliasConverter;
})();
exports.AliasConverter = AliasConverter;
