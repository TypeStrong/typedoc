var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("./events");
function Component(name) {
    return function (target) {
        target.prototype._componentName = name;
        var proto;
        if (target.prototype instanceof ConverterComponent) {
            proto = ConverterHost.prototype;
        }
        else if (target.prototype instanceof RendererComponent) {
            proto = RendererHost.prototype;
        }
        else {
            console.log("Unknown component type for '" + name + "'");
        }
        if (proto) {
            if (!proto._defaultComponents)
                proto._defaultComponents = {};
            proto._defaultComponents[name] = target;
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
var AbstractChildableComponent = (function (_super) {
    __extends(AbstractChildableComponent, _super);
    function AbstractChildableComponent(owner) {
        _super.call(this, owner);
        for (var name in this._defaultComponents) {
            this.addComponent(name, this._defaultComponents[name]);
        }
    }
    AbstractChildableComponent.prototype.getComponent = function (name) {
        if (this._componentChildren && this._componentChildren[name]) {
            return this._componentChildren[name];
        }
        else {
            return null;
        }
    };
    AbstractChildableComponent.prototype.hasComponent = function (name) {
        return !!(this._componentChildren && this._componentChildren[name]);
    };
    AbstractChildableComponent.prototype.addComponent = function (name, componentClass) {
        if (!this._componentChildren)
            this._componentChildren = {};
        if (this._componentChildren[name]) {
            return null;
        }
        else {
            return this._componentChildren[name] = new componentClass(this);
        }
    };
    AbstractChildableComponent.prototype.removeComponent = function (name) {
        if (!this._componentChildren)
            return false;
        if (this._componentChildren[name]) {
            this._componentChildren[name].stopListening();
            delete this._componentChildren[name];
            return true;
        }
        else {
            return false;
        }
    };
    AbstractChildableComponent.prototype.removeAllComponents = function () {
        if (!this._componentChildren)
            return;
        for (var name in this._componentChildren) {
            this._componentChildren[name].stopListening();
        }
        this._componentChildren = {};
    };
    AbstractChildableComponent.prototype.getParameters = function () {
        var result = [];
        for (var key in this._componentChildren) {
            var plugin = this._componentChildren[key];
            if (plugin.getParameters) {
                result.push.call(result, plugin.getParameters());
            }
        }
        return result;
    };
    return AbstractChildableComponent;
})(AbstractComponent);
exports.AbstractChildableComponent = AbstractChildableComponent;
var ApplicationHost = (function (_super) {
    __extends(ApplicationHost, _super);
    function ApplicationHost() {
        _super.apply(this, arguments);
    }
    return ApplicationHost;
})(AbstractChildableComponent);
exports.ApplicationHost = ApplicationHost;
var ApplicationComponent = (function (_super) {
    __extends(ApplicationComponent, _super);
    function ApplicationComponent() {
        _super.apply(this, arguments);
    }
    return ApplicationComponent;
})(AbstractComponent);
exports.ApplicationComponent = ApplicationComponent;
var ConverterHost = (function (_super) {
    __extends(ConverterHost, _super);
    function ConverterHost() {
        _super.apply(this, arguments);
    }
    return ConverterHost;
})(AbstractChildableComponent);
exports.ConverterHost = ConverterHost;
var ConverterComponent = (function (_super) {
    __extends(ConverterComponent, _super);
    function ConverterComponent() {
        _super.apply(this, arguments);
    }
    return ConverterComponent;
})(AbstractComponent);
exports.ConverterComponent = ConverterComponent;
var RendererHost = (function (_super) {
    __extends(RendererHost, _super);
    function RendererHost() {
        _super.apply(this, arguments);
    }
    return RendererHost;
})(AbstractChildableComponent);
exports.RendererHost = RendererHost;
var RendererComponent = (function (_super) {
    __extends(RendererComponent, _super);
    function RendererComponent() {
        _super.apply(this, arguments);
    }
    return RendererComponent;
})(AbstractComponent);
exports.RendererComponent = RendererComponent;
