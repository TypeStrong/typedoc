"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class ArrayType extends index_1.Type {
    constructor(elementType) {
        super();
        this.type = 'array';
        this.elementType = elementType;
    }
    clone() {
        return new ArrayType(this.elementType);
    }
    equals(type) {
        if (!(type instanceof ArrayType)) {
            return false;
        }
        return type.elementType.equals(this.elementType);
    }
    toObject() {
        const result = super.toObject();
        result.elementType = this.elementType.toObject();
        return result;
    }
    toString() {
        const elementTypeStr = this.elementType.toString();
        if (this.elementType instanceof index_1.UnionType || this.elementType instanceof index_1.IntersectionType) {
            return '(' + elementTypeStr + ')[]';
        }
        else {
            return elementTypeStr + '[]';
        }
    }
}
exports.ArrayType = ArrayType;
//# sourceMappingURL=array.js.map