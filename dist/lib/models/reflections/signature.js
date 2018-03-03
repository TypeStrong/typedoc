"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../types/index");
var abstract_1 = require("./abstract");
var SignatureReflection = (function (_super) {
    __extends(SignatureReflection, _super);
    function SignatureReflection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SignatureReflection.prototype.getParameterTypes = function () {
        if (!this.parameters) {
            return [];
        }
        return this.parameters.map(function (parameter) { return parameter.type; });
    };
    SignatureReflection.prototype.traverse = function (callback) {
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        if (this.typeParameters) {
            this.typeParameters.slice().forEach(function (parameter) { return callback(parameter, abstract_1.TraverseProperty.TypeParameter); });
        }
        if (this.parameters) {
            this.parameters.slice().forEach(function (parameter) { return callback(parameter, abstract_1.TraverseProperty.Parameters); });
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
            var parameters_1 = [];
            this.typeParameters.forEach(function (parameter) { return parameters_1.push(parameter.name); });
            result += '<' + parameters_1.join(', ') + '>';
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