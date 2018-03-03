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
var component_1 = require("../../../utils/component");
var models_1 = require("../../../models");
var components_1 = require("../../components");
var TypeOperatorTypeSerializer = (function (_super) {
    __extends(TypeOperatorTypeSerializer, _super);
    function TypeOperatorTypeSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypeOperatorTypeSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (t) { return t instanceof models_1.TypeOperatorType; };
    };
    TypeOperatorTypeSerializer.prototype.toObject = function (typeOperator, obj) {
        obj = obj || {};
        obj.operator = typeOperator.operator;
        obj.target = this.owner.toObject(typeOperator.target);
        return obj;
    };
    TypeOperatorTypeSerializer = __decorate([
        component_1.Component({ name: 'serializer:type-operator-type' })
    ], TypeOperatorTypeSerializer);
    return TypeOperatorTypeSerializer;
}(components_1.TypeSerializerComponent));
exports.TypeOperatorTypeSerializer = TypeOperatorTypeSerializer;
//# sourceMappingURL=type-operator.js.map