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
const models_2 = require("../models");
let ContainerReflectionSerializer = class ContainerReflectionSerializer extends components_1.ReflectionSerializerComponent {
    supports(t) {
        return t instanceof models_1.ContainerReflection;
    }
    toObject(container, obj) {
        obj = obj || {};
        if (container.groups && container.groups.length > 0) {
            obj.groups = container.groups.map(group => this.owner.toObject(group));
        }
        if (container.categories && container.categories.length > 0) {
            obj.categories = container.categories.map(category => this.owner.toObject(category));
        }
        if (container.sources && container.sources.length > 0) {
            obj.sources = container.sources
                .map(source => this.owner
                .toObject(new models_2.SourceReferenceWrapper({
                fileName: source.fileName,
                line: source.line,
                character: source.character
            })));
        }
        return obj;
    }
};
ContainerReflectionSerializer = __decorate([
    component_1.Component({ name: 'serializer:container-reflection' })
], ContainerReflectionSerializer);
exports.ContainerReflectionSerializer = ContainerReflectionSerializer;
//# sourceMappingURL=container.js.map