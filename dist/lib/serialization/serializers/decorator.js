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
var component_1 = require("../../utils/component");
var components_1 = require("../components");
var decorator_wrapper_1 = require("./models/decorator-wrapper");
var DecoratorContainerSerializer = (function (_super) {
    __extends(DecoratorContainerSerializer, _super);
    function DecoratorContainerSerializer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serializeGroup = DecoratorContainerSerializer_1.serializeGroup;
        _this.serializeGroupSymbol = decorator_wrapper_1.DecoratorWrapper;
        return _this;
    }
    DecoratorContainerSerializer_1 = DecoratorContainerSerializer;
    DecoratorContainerSerializer.serializeGroup = function (instance) {
        return instance instanceof decorator_wrapper_1.DecoratorWrapper;
    };
    DecoratorContainerSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (s) { return s instanceof decorator_wrapper_1.DecoratorWrapper; };
    };
    DecoratorContainerSerializer.prototype.toObject = function (decoratorWrapper, obj) {
        obj = obj || {};
        var decorator = decoratorWrapper.decorator;
        obj.name = decorator.name;
        if (decorator.type) {
            obj.type = this.owner.toObject(decorator.type);
        }
        if (decorator.arguments) {
            obj.arguments = decorator.arguments;
        }
        return obj;
    };
    DecoratorContainerSerializer.PRIORITY = 1000;
    DecoratorContainerSerializer = DecoratorContainerSerializer_1 = __decorate([
        component_1.Component({ name: 'serializer:decorator-container' })
    ], DecoratorContainerSerializer);
    return DecoratorContainerSerializer;
    var DecoratorContainerSerializer_1;
}(components_1.SerializerComponent));
exports.DecoratorContainerSerializer = DecoratorContainerSerializer;
//# sourceMappingURL=decorator.js.map