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
var SignatureReflectionSerializer = (function (_super) {
    __extends(SignatureReflectionSerializer, _super);
    function SignatureReflectionSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SignatureReflectionSerializer.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.supports = function (r) { return r instanceof models_1.SignatureReflection; };
    };
    SignatureReflectionSerializer.prototype.toObject = function (signature, obj) {
        obj = obj || {};
        if (signature.type) {
            obj.type = this.owner.toObject(signature.type);
        }
        if (signature.overwrites) {
            obj.overwrites = this.owner.toObject(signature.overwrites);
        }
        if (signature.inheritedFrom) {
            obj.inheritedFrom = this.owner.toObject(signature.inheritedFrom);
        }
        if (signature.implementationOf) {
            obj.implementationOf = this.owner.toObject(signature.implementationOf);
        }
        return obj;
    };
    SignatureReflectionSerializer = __decorate([
        component_1.Component({ name: 'serializer:signature-reflection' })
    ], SignatureReflectionSerializer);
    return SignatureReflectionSerializer;
}(components_1.ReflectionSerializerComponent));
exports.SignatureReflectionSerializer = SignatureReflectionSerializer;
//# sourceMappingURL=signature.js.map