"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../types/index");
const abstract_1 = require("./abstract");
class SignatureReflection extends abstract_1.Reflection {
    getParameterTypes() {
        if (!this.parameters) {
            return [];
        }
        function notUndefined(t) {
            return !!t;
        }
        return this.parameters.map(parameter => parameter.type).filter(notUndefined);
    }
    traverse(callback) {
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        if (this.typeParameters) {
            this.typeParameters.slice().forEach((parameter) => callback(parameter, abstract_1.TraverseProperty.TypeParameter));
        }
        if (this.parameters) {
            this.parameters.slice().forEach((parameter) => callback(parameter, abstract_1.TraverseProperty.Parameters));
        }
        super.traverse(callback);
    }
    toObject() {
        const result = super.toObject();
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
    }
    toString() {
        let result = super.toString();
        if (this.typeParameters) {
            const parameters = [];
            this.typeParameters.forEach((parameter) => parameters.push(parameter.name));
            result += '<' + parameters.join(', ') + '>';
        }
        if (this.type) {
            result += ':' + this.type.toString();
        }
        return result;
    }
}
exports.SignatureReflection = SignatureReflection;
//# sourceMappingURL=signature.js.map