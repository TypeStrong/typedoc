"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../../utils/component");
const models_1 = require("../../../models");
const components_1 = require("../../components");
const container_1 = require("./container");
let DeclarationReflectionSerializer = class DeclarationReflectionSerializer extends components_1.ReflectionSerializerComponent {
    supports(t) {
        return t instanceof models_1.DeclarationReflection;
    }
    toObject(declaration, obj) {
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
            obj.extendedTypes = declaration.extendedTypes.map((t) => this.owner.toObject(t));
        }
        if (declaration.extendedBy) {
            obj.extendedBy = declaration.extendedBy.map((t) => this.owner.toObject(t));
        }
        if (declaration.implementedTypes) {
            obj.implementedTypes = declaration.implementedTypes.map((t) => this.owner.toObject(t));
        }
        if (declaration.implementedBy) {
            obj.implementedBy = declaration.implementedBy.map((t) => this.owner.toObject(t));
        }
        if (declaration.implementationOf) {
            obj.implementationOf = this.owner.toObject(declaration.implementationOf);
        }
        return obj;
    }
};
DeclarationReflectionSerializer.PRIORITY = container_1.ContainerReflectionSerializer.PRIORITY - 1;
DeclarationReflectionSerializer = __decorate([
    component_1.Component({ name: 'serializer:declaration-reflection' })
], DeclarationReflectionSerializer);
exports.DeclarationReflectionSerializer = DeclarationReflectionSerializer;
//# sourceMappingURL=declaration.js.map