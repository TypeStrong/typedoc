var nodeConverters;
var typeConverters;
function loadConverters(converterClasses) {
    nodeConverters = [];
    typeConverters = [];
    for (var converterName in converterClasses) {
        var converterClass = converterClasses[converterName];
        var converter = new converterClass();
        if (converter.supportsNode && converter.convertNode) {
            nodeConverters.push(converter);
        }
        if (converter.supportsType && converter.convertType) {
            typeConverters.push(converter);
        }
    }
    nodeConverters.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
    typeConverters.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
}
function convertType(context, node, type) {
    if (node) {
        type = type || context.getTypeAtLocation(node);
        for (var _i = 0; _i < nodeConverters.length; _i++) {
            var converter = nodeConverters[_i];
            if (converter.supportsNode(context, node, type)) {
                return converter.convertNode(context, node, type);
            }
        }
    }
    if (type) {
        for (var _a = 0; _a < typeConverters.length; _a++) {
            var converter = typeConverters[_a];
            if (converter.supportsType(context, type)) {
                return converter.convertType(context, type);
            }
        }
    }
}
exports.convertType = convertType;
loadConverters(require("./types/index"));
