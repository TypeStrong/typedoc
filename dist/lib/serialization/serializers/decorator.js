"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../utils/component");
const components_1 = require("../components");
const decorator_wrapper_1 = require("./models/decorator-wrapper");
let DecoratorContainerSerializer = class DecoratorContainerSerializer extends components_1.SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = decorator_wrapper_1.DecoratorWrapper;
    }
    serializeGroup(instance) {
        return instance instanceof decorator_wrapper_1.DecoratorWrapper;
    }
    initialize() {
        super.initialize();
    }
    supports(s) {
        return s instanceof decorator_wrapper_1.DecoratorWrapper;
    }
    toObject(decoratorWrapper, obj) {
        obj = obj || {};
        const decorator = decoratorWrapper.decorator;
        obj.name = decorator.name;
        if (decorator.type) {
            obj.type = this.owner.toObject(decorator.type);
        }
        if (decorator.arguments) {
            obj.arguments = decorator.arguments;
        }
        return obj;
    }
};
DecoratorContainerSerializer.PRIORITY = 1000;
DecoratorContainerSerializer = __decorate([
    component_1.Component({ name: 'serializer:decorator-container' })
], DecoratorContainerSerializer);
exports.DecoratorContainerSerializer = DecoratorContainerSerializer;
//# sourceMappingURL=decorator.js.map