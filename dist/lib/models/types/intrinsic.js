"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class IntrinsicType extends abstract_1.Type {
    constructor(name) {
        super();
        this.type = 'intrinsic';
        this.name = name;
    }
    clone() {
        return new IntrinsicType(this.name);
    }
    equals(type) {
        return type instanceof IntrinsicType &&
            type.name === this.name;
    }
    toObject() {
        const result = super.toObject();
        result.name = this.name;
        return result;
    }
    toString() {
        return this.name;
    }
}
exports.IntrinsicType = IntrinsicType;
//# sourceMappingURL=intrinsic.js.map