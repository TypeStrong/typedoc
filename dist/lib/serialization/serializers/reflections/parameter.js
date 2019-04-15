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
let ParameterReflectionSerializer = class ParameterReflectionSerializer extends components_1.ReflectionSerializerComponent {
    supports(t) {
        return t instanceof models_1.ParameterReflection;
    }
    toObject(parameter, obj) {
        obj = obj || {};
        if (parameter.type) {
            obj.type = this.owner.toObject(parameter.type);
        }
        if (parameter.defaultValue) {
            obj.defaultValue = parameter.defaultValue;
        }
        return obj;
    }
};
ParameterReflectionSerializer = __decorate([
    component_1.Component({ name: 'serializer:parameter-reflection' })
], ParameterReflectionSerializer);
exports.ParameterReflectionSerializer = ParameterReflectionSerializer;
//# sourceMappingURL=parameter.js.map