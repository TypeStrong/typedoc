"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class TypeParameterType extends abstract_1.Type {
    constructor(name) {
        super();
        this.type = 'typeParameter';
        this.name = name;
    }
    clone() {
        const clone = new TypeParameterType(this.name);
        clone.constraint = this.constraint;
        return clone;
    }
    equals(type) {
        if (!(type instanceof TypeParameterType)) {
            return false;
        }
        if (this.constraint && type.constraint) {
            return type.constraint.equals(this.constraint);
        }
        else if (!this.constraint && !type.constraint) {
            return true;
        }
        else {
            return false;
        }
    }
    toObject() {
        const result = super.toObject();
        result.name = this.name;
        if (this.constraint) {
            result.constraint = this.constraint.toObject();
        }
        return result;
    }
    toString() {
        return this.name;
    }
}
exports.TypeParameterType = TypeParameterType;
//# sourceMappingURL=type-parameter.js.map