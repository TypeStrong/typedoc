"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const events_1 = require("./events");
const childMappings = [];
function Component(options) {
    return (target) => {
        const proto = target.prototype;
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
        const name = options.name;
        if (name) {
            proto.componentName = name;
        }
        const internal = !!options.internal;
        if (name && !internal) {
            for (const childMapping of childMappings) {
                if (!(proto instanceof childMapping.child)) {
                    continue;
                }
                const host = childMapping.host;
                host['_defaultComponents'] = host['_defaultComponents'] || {};
                host['_defaultComponents'][name] = target;
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
        options.component = target['_componentName'];
        target['_componentOptions'] = target['_componentOptions'] || [];
        target['_componentOptions'].push(options);
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
class ComponentEvent extends events_1.Event {
    constructor(name, owner, component) {
        super(name);
        this.owner = owner;
        this.component = component;
    }
}
ComponentEvent.ADDED = 'componentAdded';
ComponentEvent.REMOVED = 'componentRemoved';
exports.ComponentEvent = ComponentEvent;
exports.DUMMY_APPLICATION_OWNER = Symbol();
class AbstractComponent extends events_1.EventDispatcher {
    constructor(owner) {
        super();
        this._componentOwner = owner;
        this.initialize();
    }
    initialize() { }
    bubble(name, ...args) {
        super.trigger(name, ...args);
        if (this.owner instanceof AbstractComponent && this._componentOwner !== exports.DUMMY_APPLICATION_OWNER) {
            this.owner.bubble(name, ...args);
        }
        return this;
    }
    getOptionDeclarations() {
        return (this._componentOptions || []).slice();
    }
    get application() {
        return this._componentOwner === exports.DUMMY_APPLICATION_OWNER
            ? this
            : this._componentOwner.application;
    }
    get owner() {
        return this._componentOwner === exports.DUMMY_APPLICATION_OWNER
            ? this
            : this._componentOwner;
    }
}
exports.AbstractComponent = AbstractComponent;
class ChildableComponent extends AbstractComponent {
    constructor(owner) {
        super(owner);
        _.entries(this._defaultComponents || {}).forEach(([name, component]) => {
            this.addComponent(name, component);
        });
    }
    getComponent(name) {
        return (this._componentChildren || {})[name];
    }
    getComponents() {
        return _.values(this._componentChildren);
    }
    hasComponent(name) {
        return !!(this._componentChildren || {})[name];
    }
    addComponent(name, componentClass) {
        if (!this._componentChildren) {
            this._componentChildren = {};
        }
        if (this._componentChildren[name]) {
            return this._componentChildren[name];
        }
        else {
            const component = typeof componentClass === 'function'
                ? new componentClass(this)
                : componentClass;
            const event = new ComponentEvent(ComponentEvent.ADDED, this, component);
            this.bubble(event);
            this._componentChildren[name] = component;
            return component;
        }
    }
    removeComponent(name) {
        const component = (this._componentChildren || {})[name];
        if (component) {
            delete this._componentChildren[name];
            component.stopListening();
            this.bubble(new ComponentEvent(ComponentEvent.REMOVED, this, component));
            return component;
        }
    }
    removeAllComponents() {
        for (const component of _.values(this._componentChildren)) {
            component.stopListening();
        }
        this._componentChildren = {};
    }
}
exports.ChildableComponent = ChildableComponent;
//# sourceMappingURL=component.js.map