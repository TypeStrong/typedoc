"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class TupleType extends abstract_1.Type {
    constructor(elements) {
        super();
        this.type = 'tuple';
        this.elements = elements;
    }
    clone() {
        return new TupleType(this.elements);
    }
    equals(type) {
        if (!(type instanceof TupleType)) {
            return false;
        }
        return abstract_1.Type.isTypeListEqual(type.elements, this.elements);
    }
    toObject() {
        const result = super.toObject();
        if (this.elements && this.elements.length) {
            result.elements = this.elements.map((e) => e.toObject());
        }
        return result;
    }
    toString() {
        const names = [];
        this.elements.forEach((element) => {
            names.push(element.toString());
        });
        return '[' + names.join(', ') + ']';
    }
}
exports.TupleType = TupleType;
//# sourceMappingURL=tuple.js.map