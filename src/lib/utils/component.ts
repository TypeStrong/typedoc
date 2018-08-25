import * as _ from 'lodash';

import { Application } from '../application';
import { EventDispatcher, Event, EventMap } from './events';
import { DeclarationOption } from './options/declaration';

export interface ComponentHost {
    readonly application: Application;
}

export interface Component extends AbstractComponent<ComponentHost> {

}

export interface ComponentClass<T extends Component, O extends ComponentHost = ComponentHost> extends Function {
    new(owner: O): T;
}

export interface ComponentOptions {
    name?: string;
    childClass?: Function;
    internal?: boolean;
}

const childMappings: {host: ChildableComponent<any, any>, child: Function}[] = [];

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
            for (const childMapping of childMappings) {
                if (!(proto instanceof childMapping.child)) {
                    continue;
                }

                const host = childMapping.host;
                host['_defaultComponents'][name] = target as any;
                break;
            }
        }
    };
}

export function Option(options: DeclarationOption): PropertyDecorator {
    return function(target: object, propertyKey: string | symbol) {
        if (!(target instanceof AbstractComponent)) {
            throw new Error('The `Option` decorator can only be used on properties within an `AbstractComponent` subclass.');
        }

        options.component = target['_componentName'];
        target['_componentOptions'].push(options);

        Object.defineProperty(target, propertyKey, {
            get: function () {
                return target.application.options.getValue(options.name);
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
 * Dummy owner to be passed in to AbstractComponent / ChildableComponents if the class being constructed is
 * the application. The application does not have an owner and will return itself for component.application
 * and component.owner.
 */
export const DUMMY_APPLICATION_OWNER = Symbol();

/**
 * Component base class.
 */
export abstract class AbstractComponent<O extends ComponentHost> extends EventDispatcher implements ComponentHost {
    /**
     * The owner of this component instance.
     */
    private _componentOwner: O | typeof DUMMY_APPLICATION_OWNER;

    /**
     * The name of this component as set by the @Component decorator.
     */
    public componentName!: string;

    /**
     * A list of options defined by this component.
     */
    private _componentOptions: DeclarationOption[] = [];

    /**
     * Create new Component instance.
     */
    constructor(owner: O | typeof DUMMY_APPLICATION_OWNER) {
        super();
        this._componentOwner = owner;
        this.initialize();
    }

    /**
     * Initialize this component.
     */
    protected initialize() {}

    protected bubble(name: Event|EventMap|string, ...args: any[]) {
        super.trigger(name, ...args);

        if (this.owner instanceof AbstractComponent) {
            this.owner.bubble(name, ...args);
        }

        return this;
    }

    /**
     * Return all option declarations emitted by this component.
     */
    getOptionDeclarations(): DeclarationOption[] {
        return this._componentOptions.slice();
    }

    /**
     * Return the application / root component instance.
     */
    get application(): Application {
        return this._componentOwner === DUMMY_APPLICATION_OWNER
            ? this as any as Application
            : this._componentOwner.application;
    }

    /**
     * Return the owner of this component.
     */
    get owner(): O {
        return this._componentOwner === DUMMY_APPLICATION_OWNER
            ? this as any
            : this._componentOwner;
    }
}

/**
 * Component base class.
 */
export abstract class ChildableComponent<O extends ComponentHost, C extends Component> extends AbstractComponent<O> {
    /**
     *
     */
    private _componentChildren: {[name: string]: C} = {};

    private _defaultComponents: {[name: string]: ComponentClass<C>} = {};

    /**
     * Create new Component instance.
     */
    constructor(owner: O | typeof DUMMY_APPLICATION_OWNER) {
        super(owner);

        for (let name in this._defaultComponents) {
            this.addComponent(name, this._defaultComponents[name]);
        }
    }

    /**
     * Retrieve a plugin instance.
     *
     * @returns  The instance of the plugin or undefined if no plugin with the given class is attached.
     */
    getComponent(name: string): C | undefined {
        return this._componentChildren[name];
    }

    getComponents(): C[] {
        return _.values(this._componentChildren);
    }

    hasComponent(name: string): boolean {
        return !!this._componentChildren[name];
    }

    addComponent<T extends C>(name: string, componentClass: T|ComponentClass<T, O>): T {
        if (this._componentChildren[name]) {
            throw new Error('The component `%s` has already been added.');
        } else {
            const component: T = typeof componentClass === 'function'
                ? new (<ComponentClass<T>> componentClass)(this)
                : componentClass;
            const event = new ComponentEvent(ComponentEvent.ADDED, this, component);

            this.bubble(event);
            this._componentChildren[name] = component;

            return component;
        }
    }

    removeComponent(name: string): C | undefined {
        const component = this._componentChildren[name];
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
