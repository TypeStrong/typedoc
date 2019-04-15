"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class TypeParameterReflection extends abstract_1.Reflection {
    constructor(type, parent) {
        super(type.name, abstract_1.ReflectionKind.TypeParameter, parent);
        this.type = type.constraint;
    }
    toObject() {
        const result = super.toObject();
        if (this.type) {
            result.type = this.type.toObject();
        }
        return result;
    }
}
exports.TypeParameterReflection = TypeParameterReflection;
//# sourceMappingURL=type-parameter.js.map