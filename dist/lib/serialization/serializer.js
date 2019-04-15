"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Serializer_1;
const utils_1 = require("../utils");
const component_1 = require("../utils/component");
const components_1 = require("./components");
const events_1 = require("./events");
let Serializer = Serializer_1 = class Serializer extends utils_1.ChildableComponent {
    initialize() {
        this.router = new Map();
        this.routes = [];
    }
    addComponent(name, componentClass) {
        const component = super.addComponent(name, componentClass);
        if (component.serializeGroup && component.serializeGroupSymbol) {
            let match = this.router.get(component.serializeGroup);
            if (!match) {
                match = Array.from(this.router.values()).find(v => v.symbol === component.serializeGroupSymbol)
                    || { symbol: component.serializeGroupSymbol, group: [] };
                this.router.set(component.serializeGroup, match);
                this.routes.push(component.serializeGroup);
            }
            match.group.push(component);
            match.group.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        return component;
    }
    removeComponent(name) {
        const component = super.removeComponent(name);
        const symbol = component && component.serializeGroupSymbol;
        if (symbol) {
            const values = Array.from(this.router.values());
            for (let i = 0, len = values.length; i < len; i++) {
                const idx = values[i].group.findIndex(o => o === symbol);
                if (idx > -1) {
                    values[i].group.splice(idx, 1);
                    break;
                }
            }
        }
        return component;
    }
    removeAllComponents() {
        super.removeAllComponents();
        this.router = new Map();
        this.routes = [];
    }
    toObject(value, obj) {
        return this.findRoutes(value)
            .reduce((result, curr) => curr.toObject(value, result), obj);
    }
    projectToObject(value, eventData) {
        const eventBegin = new events_1.SerializeEvent(Serializer_1.EVENT_BEGIN, value);
        if (eventData && eventData.begin) {
            Object.assign(eventBegin, eventData.begin);
        }
        let project = eventBegin.output = {};
        this.trigger(eventBegin);
        project = this.toObject(value, project);
        const eventEnd = new events_1.SerializeEvent(Serializer_1.EVENT_END, value);
        if (eventData && eventData.end) {
            Object.assign(eventEnd, eventData.end);
        }
        eventEnd.output = project;
        this.trigger(eventEnd);
        return project;
    }
    findRoutes(value) {
        const routes = [];
        for (let i = 0, len = this.routes.length; i < len; i++) {
            if (this.routes[i](value)) {
                const serializers = this.router.get(this.routes[i]).group;
                for (let serializer of serializers) {
                    if (serializer.supports(value)) {
                        routes.push(serializer);
                    }
                }
            }
        }
        return routes;
    }
};
Serializer.EVENT_BEGIN = 'begin';
Serializer.EVENT_END = 'end';
Serializer = Serializer_1 = __decorate([
    component_1.Component({ name: 'serializer', internal: true, childClass: components_1.SerializerComponent })
], Serializer);
exports.Serializer = Serializer;
//# sourceMappingURL=serializer.js.map