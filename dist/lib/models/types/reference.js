"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class ReferenceType extends abstract_1.Type {
    constructor(name, symbolID, reflection) {
        super();
        this.type = 'reference';
        this.name = name;
        this.symbolID = symbolID;
        this.reflection = reflection;
    }
    clone() {
        const clone = new ReferenceType(this.name, this.symbolID, this.reflection);
        clone.typeArguments = this.typeArguments;
        return clone;
    }
    equals(type) {
        return type instanceof ReferenceType &&
            (type.symbolID === this.symbolID || type.reflection === this.reflection);
    }
    toObject() {
        const result = super.toObject();
        result.name = this.name;
        if (this.reflection) {
            result.id = this.reflection.id;
        }
        if (this.typeArguments && this.typeArguments.length) {
            result.typeArguments = this.typeArguments.map((t) => t.toObject());
        }
        return result;
    }
    toString() {
        const name = this.reflection ? this.reflection.name : this.name;
        let typeArgs = '';
        if (this.typeArguments) {
            typeArgs += '<';
            typeArgs += this.typeArguments.map(arg => arg.toString()).join(', ');
            typeArgs += '>';
        }
        return name + typeArgs;
    }
}
ReferenceType.SYMBOL_ID_RESOLVED = -1;
ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME = -2;
exports.ReferenceType = ReferenceType;
//# sourceMappingURL=reference.js.map