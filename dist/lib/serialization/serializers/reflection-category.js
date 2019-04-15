"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../utils/component");
const ReflectionCategory_1 = require("../../models/ReflectionCategory");
const components_1 = require("../components");
let ReflectionCategorySerializer = class ReflectionCategorySerializer extends components_1.SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = ReflectionCategory_1.ReflectionCategory;
    }
    serializeGroup(instance) {
        return instance instanceof ReflectionCategory_1.ReflectionCategory;
    }
    initialize() {
        super.initialize();
    }
    supports(r) {
        return r instanceof ReflectionCategory_1.ReflectionCategory;
    }
    toObject(category, obj) {
        obj = obj || {};
        Object.assign(obj, {
            title: category.title
        });
        if (category.children && category.children.length > 0) {
            obj.children = category.children.map(child => child.id);
        }
        return obj;
    }
};
ReflectionCategorySerializer.PRIORITY = 1000;
ReflectionCategorySerializer = __decorate([
    component_1.Component({ name: 'serializer:reflection-category' })
], ReflectionCategorySerializer);
exports.ReflectionCategorySerializer = ReflectionCategorySerializer;
//# sourceMappingURL=reflection-category.js.map