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
var container_1 = require("./container");
var DeclarationReflectionSerializer = (function (_super) {
    __extends(DeclarationReflectionSerializer, _super);
    function DeclarationReflectionSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DeclarationReflectionSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return r instanceof models_1.DeclarationReflection; };
    };
    DeclarationReflectionSerializer.prototype.toObject = function (declaration, obj) {
        var _this = this;
        obj = obj || {};
        if (declaration.type) {
            obj.type = this.owner.toObject(declaration.type);
        }
        if (declaration.defaultValue) {
            obj.defaultValue = declaration.defaultValue;
        }
        if (declaration.overwrites) {
            obj.overwrites = this.owner.toObject(declaration.overwrites);
        }
        if (declaration.inheritedFrom) {
            obj.inheritedFrom = this.owner.toObject(declaration.inheritedFrom);
        }
        if (declaration.extendedTypes) {
            obj.extendedTypes = declaration.extendedTypes.map(function (t) { return _this.owner.toObject(t); });
        }
        if (declaration.extendedBy) {
            obj.extendedBy = declaration.extendedBy.map(function (t) { return _this.owner.toObject(t); });
        }
        if (declaration.implementedTypes) {
            obj.implementedTypes = declaration.implementedTypes.map(function (t) { return _this.owner.toObject(t); });
        }
        if (declaration.implementedBy) {
            obj.implementedBy = declaration.implementedBy.map(function (t) { return _this.owner.toObject(t); });
        }
        if (declaration.implementationOf) {
            obj.implementationOf = this.owner.toObject(declaration.implementationOf);
        }
        return obj;
    };
    DeclarationReflectionSerializer.PRIORITY = container_1.ContainerReflectionSerializer.PRIORITY - 1;
    DeclarationReflectionSerializer = __decorate([
        component_1.Component({ name: 'serializer:declaration-reflection' })
    ], DeclarationReflectionSerializer);
    return DeclarationReflectionSerializer;
}(components_1.ReflectionSerializerComponent));
exports.DeclarationReflectionSerializer = DeclarationReflectionSerializer;
//# sourceMappingURL=declaration.js.map