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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var events_1 = require("./events");
var childMappings = [];
function Component(options) {
    return function (target) {
        var proto = target.prototype;
        if (!(proto instanceof AbstractComponent)) {
            throw new Error('The `Component` decorator can only be used with a subclass of `AbstractComponent`.');
        }
        if (options.childClass) {
            if (!(proto instanceof ChildableComponent)) {
                throw new Error('The `Component` decorator accepts the parameter `childClass` only when used with a subclass of `ChildableComponent`.');
            }
            childMappings.push({
                host: proto,
                child: options.childClass
            });
        }
        var name = options.name;
        if (name) {
            proto.componentName = name;
        }
        var internal = !!options.internal;
        if (name && !internal) {
            for (var _i = 0, childMappings_1 = childMappings; _i < childMappings_1.length; _i++) {
                var childMapping = childMappings_1[_i];
                if (!(proto instanceof childMapping.child)) {
                    continue;
                }
                var host = childMapping.host;
                var defaults = host._defaultComponents || (host._defaultComponents = {});
                defaults[name] = target;
                break;
            }
        }
    };
}
exports.Component = Component;
function Option(options) {
    return function (target, propertyKey) {
        if (!(target instanceof AbstractComponent)) {
            throw new Error('The `Option` decorator can only be used on properties within an `AbstractComponent` subclass.');
        }
        var list = target['_componentOptions'] || (target['_componentOptions'] = []);
        options.component = target['_componentName'];
        list.push(options);
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return this.application.options.getValue(options.name);
            },
            enumerable: true,
            configurable: true
        });
    };
}
exports.Option = Option;
var ComponentEvent = (function (_super) {
    __extends(ComponentEvent, _super);
    function ComponentEvent(name, owner, component) {
        var _this = _super.call(this, name) || this;
        _this.owner = owner;
        _this.component = component;
        return _this;
    }
    ComponentEvent.ADDED = 'componentAdded';
    ComponentEvent.REMOVED = 'componentRemoved';
    return ComponentEvent;
}(events_1.Event));
exports.ComponentEvent = ComponentEvent;
var AbstractComponent = (function (_super) {
    __extends(AbstractComponent, _super);
    function AbstractComponent(owner) {
        var _this = _super.call(this) || this;
        _this._componentOwner = owner;
        _this.initialize();
        return _this;
    }
    AbstractComponent.prototype.initialize = function () { };
    AbstractComponent.prototype.bubble = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = _super.prototype.trigger).apply.call(_a, this, arguments);
        var owner = this.owner;
        if (owner instanceof AbstractComponent) {
            owner.bubble.apply(this._componentOwner, arguments);
        }
        return this;
        var _a;
    };
    AbstractComponent.prototype.getOptionDeclarations = function () {
        return this._componentOptions ? this._componentOptions.slice() : [];
    };
    Object.defineProperty(AbstractComponent.prototype, "application", {
        get: function () {
            if (this._componentOwner) {
                return this._componentOwner.application;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractComponent.prototype, "owner", {
        get: function () {
            return this._componentOwner;
        },
        enumerable: true,
        configurable: true
    });
    return AbstractComponent;
}(events_1.EventDispatcher));
exports.AbstractComponent = AbstractComponent;
var ChildableComponent = (function (_super) {
    __extends(ChildableComponent, _super);
    function ChildableComponent(owner) {
        var _this = _super.call(this, owner) || this;
        for (var name_1 in _this._defaultComponents) {
            _this.addComponent(name_1, _this._defaultComponents[name_1]);
        }
        return _this;
    }
    ChildableComponent.prototype.getComponent = function (name) {
        if (this._componentChildren && this._componentChildren[name]) {
            return this._componentChildren[name];
        }
        else {
            return null;
        }
    };
    ChildableComponent.prototype.getComponents = function () {
        return _.values(this._componentChildren);
    };
    ChildableComponent.prototype.hasComponent = function (name) {
        return !!(this._componentChildren && this._componentChildren[name]);
    };
    ChildableComponent.prototype.addComponent = function (name, componentClass) {
        if (!this._componentChildren) {
            this._componentChildren = {};
        }
        if (this._componentChildren[name]) {
            throw new Error('The component `%s` has already been added.');
        }
        else {
            var component = typeof componentClass === 'function' ? new componentClass(this) : componentClass;
            var event_1 = new ComponentEvent(ComponentEvent.ADDED, this, component);
            this.bubble(event_1);
            this._componentChildren[name] = component;
            return component;
        }
    };
    ChildableComponent.prototype.removeComponent = function (name) {
        if (!this._componentChildren) {
            return null;
        }
        var component = this._componentChildren[name];
        if (component) {
            delete this._componentChildren[name];
            component.stopListening();
            this.bubble(new ComponentEvent(ComponentEvent.REMOVED, this, component));
            return component;
        }
        else {
            return null;
        }
    };
    ChildableComponent.prototype.removeAllComponents = function () {
        if (!this._componentChildren) {
            return;
        }
        for (var name_2 in this._componentChildren) {
            this._componentChildren[name_2].stopListening();
        }
        this._componentChildren = {};
    };
    return ChildableComponent;
}(AbstractComponent));
exports.ChildableComponent = ChildableComponent;
//# sourceMappingURL=component.js.map