var ts = require("typescript");
var Converter_1 = require("../../Converter");
var SignatureReflection_1 = require("../../../models/reflections/SignatureReflection");
var ContainerReflection_1 = require("../../../models/reflections/ContainerReflection");
var parameter_1 = require("./parameter");
var reference_1 = require("./reference");
var type_1 = require("../type");
function createSignature(context, node, name, kind) {
    var container = context.scope;
    if (!(container instanceof ContainerReflection_1.ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }
    var signature = new SignatureReflection_1.SignatureReflection(container, name, kind);
    context.registerReflection(signature, node);
    context.withScope(signature, node.typeParameters, true, function () {
        node.parameters.forEach(function (parameter) {
            parameter_1.createParameter(context, parameter);
        });
        signature.type = extractSignatureType(context, node);
        if (container.inheritedFrom) {
            signature.inheritedFrom = reference_1.createReferenceType(context, node.symbol, true);
        }
    });
    context.trigger(Converter_1.Converter.EVENT_CREATE_SIGNATURE, signature, node);
    return signature;
}
exports.createSignature = createSignature;
function extractSignatureType(context, node) {
    var checker = context.checker;
    if (node.kind & 145 || node.kind & 166) {
        try {
            var signature = checker.getSignatureFromDeclaration(node);
            return type_1.convertType(context, node.type, checker.getReturnTypeOfSignature(signature));
        }
        catch (error) { }
    }
    if (node.type) {
        return type_1.convertType(context, node.type);
    }
    else {
        return type_1.convertType(context, node);
    }
}
