var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        if (options.name) {
            var name = options.name;
            proto._componentName = name;
            for (var _i = 0; _i < childMappings.length; _i++) {
                var childMapping = childMappings[_i];
                if (!(proto instanceof childMapping.child))
                    continue;
                var host = childMapping.host;
                var defaults = host._defaultComponents || (host._defaultComponents = {});
                defaults[name] = target;
                break;
            }
        }
    };
}
exports.Component = Component;
var AbstractComponent = (function (_super) {
    __extends(AbstractComponent, _super);
    function AbstractComponent(owner) {
        _super.call(this);
        this._componentOwner = owner;
        this.initialize();
    }
    AbstractComponent.prototype.initialize = function () { };
    AbstractComponent.prototype.remove = function () {
        this.stopListening();
    };
    Object.defineProperty(AbstractComponent.prototype, "componentName", {
        get: function () {
            return this._componentName;
        },
        enumerable: true,
        configurable: true
    });
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
})(events_1.EventDispatcher);
exports.AbstractComponent = AbstractComponent;
var ChildableComponent = (function (_super) {
    __extends(ChildableComponent, _super);
    function ChildableComponent(owner) {
        _super.call(this, owner);
        for (var name in this._defaultComponents) {
            this.addComponent(name, this._defaultComponents[name]);
        }
    }
    ChildableComponent.prototype.getComponent = function (name) {
        if (this._componentChildren && this._componentChildren[name]) {
            return this._componentChildren[name];
        }
        else {
            return null;
        }
    };
    ChildableComponent.prototype.hasComponent = function (name) {
        return !!(this._componentChildren && this._componentChildren[name]);
    };
    ChildableComponent.prototype.addComponent = function (name, componentClass) {
        if (!this._componentChildren)
            this._componentChildren = {};
        if (this._componentChildren[name]) {
            return null;
        }
        else {
            return this._componentChildren[name] = new componentClass(this);
        }
    };
    ChildableComponent.prototype.removeComponent = function (name) {
        if (!this._componentChildren)
            return null;
        var component = this._componentChildren[name];
        if (component) {
            delete this._componentChildren[name];
            component.stopListening();
            return component;
        }
        else {
            return null;
        }
    };
    ChildableComponent.prototype.removeAllComponents = function () {
        if (!this._componentChildren)
            return;
        for (var name in this._componentChildren) {
            this._componentChildren[name].stopListening();
        }
        this._componentChildren = {};
    };
    ChildableComponent.prototype.getParameters = function () {
        var result = [];
        for (var key in this._componentChildren) {
            var plugin = this._componentChildren[key];
            if (plugin.getParameters) {
                result.push.call(result, plugin.getParameters());
            }
        }
        return result;
    };
    return ChildableComponent;
})(AbstractComponent);
exports.ChildableComponent = ChildableComponent;
