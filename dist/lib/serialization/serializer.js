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
var utils_1 = require("../utils");
var component_1 = require("../utils/component");
var components_1 = require("./components");
var events_1 = require("./events");
var Serializer = (function (_super) {
    __extends(Serializer, _super);
    function Serializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Serializer_1 = Serializer;
    Serializer.prototype.initialize = function () {
        this.router = new Map();
        this.routes = [];
    };
    Serializer.prototype.addComponent = function (name, componentClass) {
        var component = _super.prototype.addComponent.call(this, name, componentClass);
        if (component.serializeGroup && component.serializeGroupSymbol) {
            var match = this.router.get(component.serializeGroup);
            if (!match) {
                match = Array.from(this.router.values()).find(function (v) { return v.symbol === component.serializeGroupSymbol; })
                    || { symbol: component.serializeGroupSymbol, group: [] };
                this.router.set(component.serializeGroup, match);
                this.routes.push(component.serializeGroup);
            }
            match.group.push(component);
            match.group.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
            return component;
        }
    };
    Serializer.prototype.removeComponent = function (name) {
        var component = _super.prototype.removeComponent.call(this, name);
        var symbol = component && component.serializeGroupSymbol;
        if (symbol) {
            var values = Array.from(this.router.values());
            for (var i = 0, len = values.length; i < len; i++) {
                var idx = values[i].group.findIndex(function (o) { return o === symbol; });
                if (idx > -1) {
                    values[i].group.splice(idx, 1);
                    break;
                }
            }
        }
        return component;
    };
    Serializer.prototype.removeAllComponents = function () {
        _super.prototype.removeAllComponents.call(this);
        this.router = new Map();
        this.routes = [];
    };
    Serializer.prototype.toObject = function (value, obj) {
        return this.findRoutes(value)
            .reduce(function (result, curr) { return curr.toObject(value, result); }, obj);
    };
    Serializer.prototype.projectToObject = function (value, eventData) {
        var eventBegin = new events_1.SerializeEvent(Serializer_1.EVENT_BEGIN);
        if (eventData && eventData.begin) {
            Object.assign(eventBegin, eventData.begin);
        }
        eventBegin.project = value;
        var project = eventBegin.output = {};
        this.trigger(eventBegin);
        project = this.toObject(value, project);
        var eventEnd = new events_1.SerializeEvent(Serializer_1.EVENT_END);
        if (eventData && eventData.end) {
            Object.assign(eventEnd, eventData.end);
        }
        eventEnd.project = value;
        eventEnd.output = project;
        this.trigger(eventEnd);
        return project;
    };
    Serializer.prototype.findRoutes = function (value) {
        var routes = [];
        for (var i = 0, len = this.routes.length; i < len; i++) {
            if (this.routes[i](value)) {
                var serializers = this.router.get(this.routes[i]).group;
                for (var _i = 0, serializers_1 = serializers; _i < serializers_1.length; _i++) {
                    var serializer = serializers_1[_i];
                    if (serializer.supports(value)) {
                        routes.push(serializer);
                    }
                }
            }
        }
        return routes;
    };
    Serializer.EVENT_BEGIN = 'begin';
    Serializer.EVENT_END = 'end';
    Serializer = Serializer_1 = __decorate([
        component_1.Component({ name: 'serializer', internal: true, childClass: components_1.SerializerComponent })
    ], Serializer);
    return Serializer;
    var Serializer_1;
}(utils_1.ChildableComponent));
exports.Serializer = Serializer;
//# sourceMappingURL=serializer.js.map