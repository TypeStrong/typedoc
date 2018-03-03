"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var index_1 = require("../../models/index");
var converter_1 = require("../converter");
var parameter_1 = require("./parameter");
var reference_1 = require("./reference");
function createSignature(context, node, name, kind) {
    var container = context.scope;
    if (!(container instanceof index_1.ContainerReflection)) {
        throw new Error('Expected container reflection.');
    }
    var signature = new index_1.SignatureReflection(container, name, kind);
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
    context.trigger(converter_1.Converter.EVENT_CREATE_SIGNATURE, signature, node);
    return signature;
}
exports.createSignature = createSignature;
function extractSignatureType(context, node) {
    var checker = context.checker;
    if (node.kind & ts.SyntaxKind.CallSignature || node.kind & ts.SyntaxKind.CallExpression) {
        try {
            var signature = checker.getSignatureFromDeclaration(node);
            return context.converter.convertType(context, node.type, checker.getReturnTypeOfSignature(signature));
        }
        catch (error) { }
    }
    if (node.type) {
        return context.converter.convertType(context, node.type);
    }
    else {
        return context.converter.convertType(context, node);
    }
}
//# sourceMappingURL=signature.js.map