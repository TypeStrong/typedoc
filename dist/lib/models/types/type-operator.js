"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class TypeOperatorType extends abstract_1.Type {
    constructor(target) {
        super();
        this.type = 'typeOperator';
        this.operator = 'keyof';
        this.target = target;
    }
    clone() {
        return new TypeOperatorType(this.target.clone());
    }
    equals(type) {
        if (!(type instanceof TypeOperatorType)) {
            return false;
        }
        return type.target.equals(this.target);
    }
    toObject() {
        const result = super.toObject();
        result.operator = this.operator;
        result.target = this.target.toObject();
        return result;
    }
    toString() {
        return `${this.operator} ${this.target.toString()}`;
    }
}
exports.TypeOperatorType = TypeOperatorType;
//# sourceMappingURL=type-operator.js.map