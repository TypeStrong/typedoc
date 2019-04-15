"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class StringLiteralType extends abstract_1.Type {
    constructor(value) {
        super();
        this.type = 'stringLiteral';
        this.value = value;
    }
    clone() {
        return new StringLiteralType(this.value);
    }
    equals(type) {
        return type instanceof StringLiteralType &&
            type.value === this.value;
    }
    toObject() {
        const result = super.toObject();
        result.value = this.value;
        return result;
    }
    toString() {
        return '"' + this.value + '"';
    }
}
exports.StringLiteralType = StringLiteralType;
//# sourceMappingURL=string-literal.js.map