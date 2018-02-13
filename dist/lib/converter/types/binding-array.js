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
var BindingArrayConverter = (function (_super) {
    __extends(BindingArrayConverter, _super);
    function BindingArrayConverter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BindingArrayConverter.prototype.supportsNode = function (context, node) {
        return node.kind === ts.SyntaxKind.ArrayBindingPattern;
    };
    BindingArrayConverter.prototype.convertNode = function (context, node) {
        var _this = this;
        var types = [];
        node.elements.forEach(function (element) {
            types.push(_this.owner.convertType(context, element));
        });
        return new index_1.TupleType(types);
    };
    BindingArrayConverter = __decorate([
        components_1.Component({ name: 'type:binding-array' })
    ], BindingArrayConverter);
    return BindingArrayConverter;
}(components_1.ConverterTypeComponent));
exports.BindingArrayConverter = BindingArrayConverter;
//# sourceMappingURL=binding-array.js.map