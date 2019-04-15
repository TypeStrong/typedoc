"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = require("../../models/reflections/signature");
function ifSignature(obj, arg) {
    if (obj instanceof signature_1.SignatureReflection) {
        return arg.fn(this);
    }
    else {
        return arg.inverse(this);
    }
}
exports.ifSignature = ifSignature;
//# sourceMappingURL=if-signature.js.map