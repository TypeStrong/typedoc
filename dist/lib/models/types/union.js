"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
class UnionType extends abstract_1.Type {
    constructor(types) {
        super();
        this.type = 'union';
        this.types = types;
    }
    clone() {
        return new UnionType(this.types);
    }
    equals(type) {
        if (!(type instanceof UnionType)) {
            return false;
        }
        return abstract_1.Type.isTypeListSimilar(type.types, this.types);
    }
    toObject() {
        const result = super.toObject();
        if (this.types && this.types.length) {
            result.types = this.types.map((e) => e.toObject());
        }
        return result;
    }
    toString() {
        const names = [];
        this.types.forEach((element) => {
            names.push(element.toString());
        });
        return names.join(' | ');
    }
}
exports.UnionType = UnionType;
//# sourceMappingURL=union.js.map