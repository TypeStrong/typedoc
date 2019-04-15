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
const abstract_1 = require("../../../models/reflections/abstract");
let ReflectionSerializer = class ReflectionSerializer extends components_1.ReflectionSerializerComponent {
    supports(t) {
        return t instanceof models_1.Reflection;
    }
    toObject(reflection, obj) {
        obj = obj || {};
        Object.assign(obj, {
            id: reflection.id,
            name: reflection.name,
            kind: reflection.kind,
            kindString: reflection.kindString,
            flags: {}
        });
        if (reflection.originalName !== reflection.name) {
            obj.originalName = reflection.originalName;
        }
        if (reflection.comment) {
            obj.comment = this.owner.toObject(reflection.comment);
        }
        for (const key of Object.getOwnPropertyNames(abstract_1.ReflectionFlags.prototype)) {
            if (reflection.flags[key] === true) {
                obj.flags[key] = true;
            }
        }
        if (reflection.decorates && reflection.decorates.length > 0) {
            obj.decorates = reflection.decorates.map(t => this.owner.toObject(t));
        }
        if (reflection.decorators && reflection.decorators.length > 0) {
            obj.decorators = reflection.decorators.map(d => this.owner.toObject(new models_2.DecoratorWrapper(d)));
        }
        reflection.traverse((child, property) => {
            if (property === models_1.TraverseProperty.TypeLiteral) {
                return;
            }
            let name = models_1.TraverseProperty[property];
            name = name.substr(0, 1).toLowerCase() + name.substr(1);
            if (!obj[name]) {
                obj[name] = [];
            }
            obj[name].push(this.owner.toObject(child));
        });
        return obj;
    }
};
ReflectionSerializer.PRIORITY = 1000;
ReflectionSerializer = __decorate([
    component_1.Component({ name: 'serializer:reflection' })
], ReflectionSerializer);
exports.ReflectionSerializer = ReflectionSerializer;
//# sourceMappingURL=abstract.js.map