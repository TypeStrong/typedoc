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
var IntersectionTypeSerializer = (function (_super) {
    __extends(IntersectionTypeSerializer, _super);
    function IntersectionTypeSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntersectionTypeSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (t) { return t instanceof models_1.IntersectionType || t instanceof models_1.UnionType; };
    };
    IntersectionTypeSerializer.prototype.toObject = function (intersectionUnion, obj) {
        var _this = this;
        obj = obj || {};
        if (intersectionUnion.types && intersectionUnion.types.length) {
            obj.types = intersectionUnion.types.map(function (t) { return _this.owner.toObject(t); });
        }
        return obj;
    };
    IntersectionTypeSerializer = __decorate([
        component_1.Component({ name: 'serializer:intersection-type' })
    ], IntersectionTypeSerializer);
    return IntersectionTypeSerializer;
}(components_1.TypeSerializerComponent));
exports.IntersectionTypeSerializer = IntersectionTypeSerializer;
//# sourceMappingURL=intersection-union.js.map