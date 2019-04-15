"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
const index_1 = require("../types/index");
const container_1 = require("./container");
class DeclarationReflection extends container_1.ContainerReflection {
    hasGetterOrSetter() {
        return !!this.getSignature || !!this.setSignature;
    }
    getAllSignatures() {
        let result = [];
        if (this.signatures) {
            result = result.concat(this.signatures);
        }
        if (this.indexSignature) {
            result.push(this.indexSignature);
        }
        if (this.getSignature) {
            result.push(this.getSignature);
        }
        if (this.setSignature) {
            result.push(this.setSignature);
        }
        return result;
    }
    traverse(callback) {
        if (this.typeParameters) {
            this.typeParameters.slice().forEach((parameter) => callback(parameter, abstract_1.TraverseProperty.TypeParameter));
        }
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        if (this.signatures) {
            this.signatures.slice().forEach((signature) => callback(signature, abstract_1.TraverseProperty.Signatures));
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
        super.traverse(callback);
    }
    toObject() {
        let result = super.toObject();
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
            result.extendedTypes = this.extendedTypes.map((t) => t.toObject());
        }
        if (this.extendedBy) {
            result.extendedBy = this.extendedBy.map((t) => t.toObject());
        }
        if (this.implementedTypes) {
            result.implementedTypes = this.implementedTypes.map((t) => t.toObject());
        }
        if (this.implementedBy) {
            result.implementedBy = this.implementedBy.map((t) => t.toObject());
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
            this.typeParameters.forEach((parameter) => {
                parameters.push(parameter.name);
            });
            result += '<' + parameters.join(', ') + '>';
        }
        if (this.type) {
            result += ':' + this.type.toString();
        }
        return result;
    }
}
exports.DeclarationReflection = DeclarationReflection;
//# sourceMappingURL=declaration.js.map