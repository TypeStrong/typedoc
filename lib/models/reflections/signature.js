"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../types/index");
var abstract_1 = require("./abstract");
var SignatureReflection = (function (_super) {
    __extends(SignatureReflection, _super);
    function SignatureReflection() {
        _super.apply(this, arguments);
    }
    SignatureReflection.prototype.getParameterTypes = function () {
        if (!this.parameters)
            return [];
        return this.parameters.map(function (parameter) { return parameter.type; });
    };
    SignatureReflection.prototype.traverse = function (callback) {
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        if (this.typeParameters) {
            this.typeParameters.forEach(function (parameter) { return callback(parameter, abstract_1.TraverseProperty.TypeParameter); });
        }
        if (this.parameters) {
            this.parameters.forEach(function (parameter) { return callback(parameter, abstract_1.TraverseProperty.Parameters); });
        }
        _super.prototype.traverse.call(this, callback);
    };
    SignatureReflection.prototype.toObject = function () {
        var result = _super.prototype.toObject.call(this);
        if (this.type) {
            result.type = this.type.toObject();
        }
        if (this.overwrites) {
            result.overwrites = this.overwrites.toObject();
        }
        if (this.inheritedFrom) {
            result.inheritedFrom = this.inheritedFrom.toObject();
        }
        if (this.implementationOf) {
            result.implementationOf = this.implementationOf.toObject();
        }
        return result;
    };
    SignatureReflection.prototype.toString = function () {
        var result = _super.prototype.toString.call(this);
        if (this.typeParameters) {
            var parameters = [];
            this.typeParameters.forEach(function (parameter) { return parameters.push(parameter.name); });
            result += '<' + parameters.join(', ') + '>';
        }
        if (this.type) {
            result += ':' + this.type.toString();
        }
        return result;
    };
    return SignatureReflection;
}(abstract_1.Reflection));
exports.SignatureReflection = SignatureReflection;
//# sourceMappingURL=signature.js.map