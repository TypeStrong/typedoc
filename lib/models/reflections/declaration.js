"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstract_1 = require("./abstract");
var index_1 = require("../types/index");
var container_1 = require("./container");
var DeclarationReflection = (function (_super) {
    __extends(DeclarationReflection, _super);
    function DeclarationReflection() {
        _super.apply(this, arguments);
    }
    DeclarationReflection.prototype.hasGetterOrSetter = function () {
        return !!this.getSignature || !!this.setSignature;
    };
    DeclarationReflection.prototype.getAllSignatures = function () {
        var result = [];
        if (this.signatures)
            result = result.concat(this.signatures);
        if (this.indexSignature)
            result.push(this.indexSignature);
        if (this.getSignature)
            result.push(this.getSignature);
        if (this.setSignature)
            result.push(this.setSignature);
        return result;
    };
    DeclarationReflection.prototype.traverse = function (callback) {
        if (this.typeParameters) {
            this.typeParameters.forEach(function (parameter) { return callback(parameter, abstract_1.TraverseProperty.TypeParameter); });
        }
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        if (this.signatures) {
            this.signatures.forEach(function (signature) { return callback(signature, abstract_1.TraverseProperty.Signatures); });
        }
        if (this.indexSignature) {
            callback(this.indexSignature, abstract_1.TraverseProperty.IndexSignature);
        }
        if (this.getSignature) {
            callback(this.getSignature, abstract_1.TraverseProperty.GetSignature);
        }
        if (this.setSignature) {
            callback(this.setSignature, abstract_1.TraverseProperty.SetSignature);
        }
        _super.prototype.traverse.call(this, callback);
    };
    DeclarationReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.type) {
            result.type = this.type.toObject();
        }
        if (this.defaultValue) {
            result.defaultValue = this.defaultValue;
        }
        if (this.overwrites) {
            result.overwrites = this.overwrites.toObject();
        }
        if (this.inheritedFrom) {
            result.inheritedFrom = this.inheritedFrom.toObject();
        }
        if (this.extendedTypes) {
            result.extendedTypes = this.extendedTypes.map(function (t) { return t.toObject(); });
        }
        if (this.extendedBy) {
            result.extendedBy = this.extendedBy.map(function (t) { return t.toObject(); });
        }
        if (this.implementedTypes) {
            result.implementedTypes = this.implementedTypes.map(function (t) { return t.toObject(); });
        }
        if (this.implementedBy) {
            result.implementedBy = this.implementedBy.map(function (t) { return t.toObject(); });
        }
        if (this.implementationOf) {
            result.implementationOf = this.implementationOf.toObject();
        }
        return result;
    };
    DeclarationReflection.prototype.toString = function () {
        var result = _super.prototype.toString.call(this);
        if (this.typeParameters) {
            var parameters = [];
            this.typeParameters.forEach(function (parameter) {
                parameters.push(parameter.name);
            });
            result += '<' + parameters.join(', ') + '>';
        }
        if (this.type) {
            result += ':' + this.type.toString();
        }
        return result;
    };
    return DeclarationReflection;
}(container_1.ContainerReflection));
exports.DeclarationReflection = DeclarationReflection;
//# sourceMappingURL=declaration.js.map