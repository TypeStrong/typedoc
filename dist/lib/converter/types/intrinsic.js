"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const index_1 = require("../../models/index");
const components_1 = require("../components");
const IntrinsicTypeFlags = ts.TypeFlags.Intrinsic;
if (IntrinsicTypeFlags === undefined) {
    throw new Error('Internal TypeScript API missing: TypeFlags.Intrinsic');
}
let IntrinsicConverter = class IntrinsicConverter extends components_1.ConverterTypeComponent {
    supportsType(context, type) {
        return !!(type.flags & IntrinsicTypeFlags);
    }
    convertType(context, type) {
        let intrinsicName = context.program.getTypeChecker().typeToString(type);
        return new index_1.IntrinsicType(intrinsicName);
    }
};
IntrinsicConverter = __decorate([
    components_1.Component({ name: 'type:intrinsic' })
], IntrinsicConverter);
exports.IntrinsicConverter = IntrinsicConverter;
//# sourceMappingURL=intrinsic.js.map