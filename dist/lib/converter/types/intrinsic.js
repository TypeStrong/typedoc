"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var index_1 = require("../../models/index");
var components_1 = require("../components");
var IntrinsicTypeFlags = ts.TypeFlags.Intrinsic;
if (IntrinsicTypeFlags === undefined) {
    throw new Error('Internal TypeScript API missing: TypeFlags.Intrinsic');
}
var IntrinsicConverter = (function (_super) {
    __extends(IntrinsicConverter, _super);
    function IntrinsicConverter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntrinsicConverter.prototype.supportsType = function (context, type) {
        return !!(type.flags & IntrinsicTypeFlags);
    };
    IntrinsicConverter.prototype.convertType = function (context, type) {
        var intrinsicName = context.program.getTypeChecker().typeToString(type);
        return new index_1.IntrinsicType(intrinsicName);
    };
    IntrinsicConverter = __decorate([
        components_1.Component({ name: 'type:intrinsic' })
    ], IntrinsicConverter);
    return IntrinsicConverter;
}(components_1.ConverterTypeComponent));
exports.IntrinsicConverter = IntrinsicConverter;
//# sourceMappingURL=intrinsic.js.map