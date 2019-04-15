"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../types/index");
const abstract_1 = require("./abstract");
class ParameterReflection extends abstract_1.Reflection {
    traverse(callback) {
        if (this.type instanceof index_1.ReflectionType) {
            callback(this.type.declaration, abstract_1.TraverseProperty.TypeLiteral);
        }
        super.traverse(callback);
    }
    toObject() {
        const result = super.toObject();
        if (this.type) {
            result.type = this.type.toObject();
        }
        if (this.defaultValue) {
            result.defaultValue = this.defaultValue;
        }
        return result;
    }
    toString() {
        return super.toString() + (this.type ? ':' + this.type.toString() : '');
    }
}
exports.ParameterReflection = ParameterReflection;
//# sourceMappingURL=parameter.js.map