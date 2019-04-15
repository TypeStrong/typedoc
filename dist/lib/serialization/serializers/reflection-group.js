"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../utils/component");
const ReflectionGroup_1 = require("../../models/ReflectionGroup");
const components_1 = require("../components");
let ReflectionGroupSerializer = class ReflectionGroupSerializer extends components_1.SerializerComponent {
    constructor() {
        super(...arguments);
        this.serializeGroupSymbol = ReflectionGroup_1.ReflectionGroup;
    }
    serializeGroup(instance) {
        return instance instanceof ReflectionGroup_1.ReflectionGroup;
    }
    initialize() {
        super.initialize();
    }
    supports(r) {
        return r instanceof ReflectionGroup_1.ReflectionGroup;
    }
    toObject(group, obj) {
        obj = obj || {};
        Object.assign(obj, {
            title: group.title,
            kind: group.kind
        });
        if (group.children && group.children.length > 0) {
            obj.children = group.children.map(child => child.id);
        }
        if (group.categories && group.categories.length > 0) {
            obj.categories = group.categories.map(category => this.owner.toObject(category));
        }
        return obj;
    }
};
ReflectionGroupSerializer.PRIORITY = 1000;
ReflectionGroupSerializer = __decorate([
    component_1.Component({ name: 'serializer:reflection-group' })
], ReflectionGroupSerializer);
exports.ReflectionGroupSerializer = ReflectionGroupSerializer;
//# sourceMappingURL=reflection-group.js.map