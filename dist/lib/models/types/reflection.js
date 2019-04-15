"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class ReflectionType extends abstract_1.Type {
    constructor(declaration) {
        super();
        this.type = 'reflection';
        this.declaration = declaration;
    }
    clone() {
        return new ReflectionType(this.declaration);
    }
    equals(type) {
        return type === this;
    }
    toObject() {
        const result = super.toObject();
        if (this.declaration) {
            result.declaration = this.declaration.toObject();
        }
        return result;
    }
    toString() {
        if (!this.declaration.children && this.declaration.signatures) {
            return 'function';
        }
        else {
            return 'object';
        }
    }
}
exports.ReflectionType = ReflectionType;
//# sourceMappingURL=reflection.js.map