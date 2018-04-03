import * as _ from 'lodash';

import { Application } from '../application';
import { EventDispatcher, Event, EventMap } from './events';
import { DeclarationOption } from './options/declaration';

export interface ComponentHost {
    application: Application;
}

export interface Component extends AbstractComponent<ComponentHost> {

}

export interface ComponentClass<T extends Component> extends Function {
    new(owner: ComponentHost): T;
}

export interface ComponentOptions {
    name?: string;
    childClass?: Function;
    internal?: boolean;
}

const childMappings: {host: any, child: Function}[] = [];

export function Component(options: ComponentOptions): ClassDecorator {
    return (target: Function) => {
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
            for (let childMapping of childMappings) {
                if (!(proto instanceof childMapping.child)) {
                    continue;
                }

                const host = childMapping.host;
                const defaults = host._defaultComponents || (host._defaultComponents = {});
                defaults[name] = target;
                break;
            }
        }
    };
}

export function Option(options: DeclarationOption): PropertyDecorator {
    return function(target: AbstractComponent<any>, propertyKey: string) {
        if (!(target instanceof AbstractComponent)) {
            throw new Error('The `Option` decorator can only be used on properties within an `AbstractComponent` subclass.');
        }

        const list = target['_componentOptions'] || (target['_componentOptions'] = []);
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

export class ComponentEvent extends Event {
    owner: ComponentHost;

    component: AbstractComponent<ComponentHost>;

    static ADDED = 'componentAdded';

    static REMOVED = 'componentRemoved';

    constructor(name: string, owner: ComponentHost, component: AbstractComponent<ComponentHost>) {
        super(name);
        this.owner = owner;
        this.component = component;
    }
}

/**
 * Component base class.
 */
export abstract class AbstractComponent<O extends ComponentHost> extends EventDispatcher implements ComponentHost {
    /**
     * The owner of this component instance.
     */
    private _componentOwner: O;

    /**
     * The name of this component as set by the @Component decorator.
     */
    public componentName: string;

    /**
     * A list of options defined by this component.
     */
    private _componentOptions: DeclarationOption[];

    /**
     * Create new Component instance.
     */
    constructor(owner: O) {
        super();
        this._componentOwner = owner;
        this.initialize();
    }

    /**
     * Initialize this component.
     */
    protected initialize() {}

    protected bubble(name: Event|EventMap|string, ...args: any[]) {
        super.trigger.apply(this, arguments);

        const owner = <any> this.owner;
        if (owner instanceof AbstractComponent) {
            owner.bubble.apply(this._componentOwner, arguments);
        }

        return this;
    }

    /**
     * Return all option declarations emitted by this component.
     */
    getOptionDeclarations(): DeclarationOption[] {
        return this._componentOptions ? this._componentOptions.slice() : [];
    }

    /**
     * Return the application / root component instance.
     */
    get application(): Application {
        if (this._componentOwner) {
            return this._componentOwner.application;
        } else {
            return null;
        }
    }

    /**
     * Return the owner of this component.
     */
    get owner(): O {
        return this._componentOwner;
    }
}

/**
 * Component base class.
 */
export abstract class ChildableComponent<O extends ComponentHost, C extends Component> extends AbstractComponent<O> {
    /**
     *
     */
    private _componentChildren: {[name: string]: C};

    private _defaultComponents: {[name: string]: ComponentClass<C>};

    /**
     * Create new Component instance.
     */
    constructor(owner: O) {
        super(owner);

        for (let name in this._defaultComponents) {
            this.addComponent(name, this._defaultComponents[name]);
        }
    }

    /**
     * Retrieve a plugin instance.
     *
     * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
     */
    getComponent(name: string): C {
        if (this._componentChildren && this._componentChildren[name]) {
            return this._componentChildren[name];
        } else {
            return null;
        }
    }

    getComponents(): C[] {
        return _.values<C>(this._componentChildren);
    }

    hasComponent(name: string): boolean {
        return !!(this._componentChildren && this._componentChildren[name]);
    }

    addComponent<T extends C & Component>(name: string, componentClass: T|ComponentClass<T>): T {
        if (!this._componentChildren) {
            this._componentChildren = {};
        }

        if (this._componentChildren[name]) {
            throw new Error('The component `%s` has already been added.');
        } else {
            const component: T = typeof componentClass === 'function' ? new (<ComponentClass<T>> componentClass)(this) : <T> componentClass;
            const event = new ComponentEvent(ComponentEvent.ADDED, this, component);

            this.bubble(event);
            this._componentChildren[name] = component;

            return component;
        }
    }

    removeComponent(name: string): C {
        if (!this._componentChildren) {
            return null;
        }
        const component = this._componentChildren[name];
        if (component) {
            delete this._componentChildren[name];
            component.stopListening();
            this.bubble(new ComponentEvent(ComponentEvent.REMOVED, this, component));
            return component;
        } else {
            return null;
        }
    }

    removeAllComponents() {
        if (!this._componentChildren) {
            return;
        }
        for (let name in this._componentChildren) {
            this._componentChildren[name].stopListening();
        }

        this._componentChildren = {};
    }
}
