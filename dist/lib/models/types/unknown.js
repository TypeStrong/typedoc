"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class UnknownType extends abstract_1.Type {
    constructor(name) {
        super();
        this.type = 'unknown';
        this.name = name;
    }
    clone() {
        return new UnknownType(this.name);
    }
    equals(type) {
        return type instanceof UnknownType &&
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
exports.UnknownType = UnknownType;
//# sourceMappingURL=unknown.js.map