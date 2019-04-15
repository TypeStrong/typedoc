"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Type {
    constructor() {
        this.type = 'void';
    }
    equals(type) {
        return false;
    }
    toObject() {
        let result = {};
        result.type = this.type;
        return result;
    }
    toString() {
        return 'void';
    }
    static isTypeListSimilar(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        outerLoop: for (let an = 0, count = a.length; an < count; an++) {
            const at = a[an];
            for (let bn = 0; bn < count; bn++) {
                if (b[bn].equals(at)) {
                    continue outerLoop;
                }
            }
            return false;
        }
        return true;
    }
    static isTypeListEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let index = 0, count = a.length; index < count; index++) {
            if (!a[index].equals(b[index])) {
                return false;
            }
        }
        return true;
    }
}
exports.Type = Type;
//# sourceMappingURL=abstract.js.map