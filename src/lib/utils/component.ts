import type { Application } from "../application";
import { EventDispatcher, Event, EventMap } from "./events";

/**
 * Exposes a reference to the root Application component.
 */
export interface ComponentHost {
    readonly application: Application;
}

export interface Component extends AbstractComponent<ComponentHost> {}

export interface ComponentClass<
    T extends Component,
    O extends ComponentHost = ComponentHost,
> extends Function {
    new (owner: O): T;
}

/**
 * Option-bag passed to Component decorator.
 */
export interface ComponentOptions {
    name?: string;
    /** Specify valid child component class.  Used to prove that children are valid via `instanceof` checks */
    childClass?: Function;
    internal?: boolean;
}

const childMappings: {
    host: ChildableComponent<any, any>;
    child: Function;
}[] = [];

/**
 * Class decorator applied to Components
 */
export function Component(options: ComponentOptions) {
    // _context is ClassDecoratorContext, but that then requires a public constructor
    // which Application does not have.
    return (target: Function, _context: unknown) => {
        const proto = target.prototype;
        if (!(proto instanceof AbstractComponent)) {
            throw new Error(
                "The `Component` decorator can only be used with a subclass of `AbstractComponent`.",
            );
        }

        if (options.childClass) {
            if (!(proto instanceof ChildableComponent)) {
                throw new Error(
                    "The `Component` decorator accepts the parameter `childClass` only when used with a subclass of `ChildableComponent`.",
                );
            }

            childMappings.push({
                host: proto,
                child: options.childClass,
            });
        }

        const name = options.name;
        if (name) {
            proto.componentName = name;
        }

        // If not marked internal, and if we are a subclass of another component T's declared
        // childClass, then register ourselves as a _defaultComponents of T.
        const internal = !!options.internal;
        if (name && !internal) {
            for (const childMapping of childMappings) {
                if (!(proto instanceof childMapping.child)) {
                    continue;
                }

                const host = childMapping.host;
                host["_defaultComponents"] = host["_defaultComponents"] || {};
                host["_defaultComponents"][name] = target as any;
                break;
            }
        }
    };
}

export class ComponentEvent extends Event {
    owner: ComponentHost;

    component: AbstractComponent<ComponentHost>;

    static ADDED = "componentAdded";

    static REMOVED = "componentRemoved";

    constructor(
        name: string,
        owner: ComponentHost,
        component: AbstractComponent<ComponentHost>,
    ) {
        super(name);
        this.owner = owner;
        this.component = component;
    }
}

/**
 * Component base class.  Has an owner (unless it's the application root component),
 * can dispatch events to its children, and has access to the root Application component.
 *
 * @template O type of component's owner.
 */
export abstract class AbstractComponent<O extends ComponentHost>
    extends EventDispatcher
    implements ComponentHost
{
    /**
     * The owner of this component instance.
     */
    private _componentOwner: O;

    /**
     * The name of this component as set by the `@Component` decorator.
     */
    public componentName!: string;

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
    protected initialize() {
        // empty default implementation
    }

    protected bubble(name: Event | EventMap | string, ...args: any[]) {
        super.trigger(name, ...args);

        if (
            this.owner instanceof AbstractComponent &&
            this._componentOwner !== null
        ) {
            this.owner.bubble(name, ...args);
        }

        return this;
    }

    /**
     * Return the application / root component instance.
     */
    get application(): Application {
        if (this._componentOwner === null) {
            return this as any as Application;
        }
        return this._componentOwner.application;
    }

    /**
     * Return the owner of this component.
     */
    get owner(): O {
        return this._componentOwner === null
            ? (this as any)
            : this._componentOwner;
    }
}

/**
 * Component that can have child components.
 *
 * @template O type of Component's owner
 * @template C type of Component's children
 */
export abstract class ChildableComponent<
    O extends ComponentHost,
    C extends Component,
> extends AbstractComponent<O> {
    /**
     *
     */
    private _componentChildren?: { [name: string]: C };

    private _defaultComponents?: { [name: string]: ComponentClass<C> };

    /**
     * Create new Component instance.
     */
    constructor(owner: O) {
        super(owner);

        Object.entries(this._defaultComponents || {}).forEach(
            ([name, component]) => {
                this.addComponent(name, component);
            },
        );
    }

    /**
     * Retrieve a plugin instance.
     *
     * @returns  The instance of the plugin or undefined if no plugin with the given class is attached.
     */
    getComponent(name: string): C | undefined {
        return (this._componentChildren || {})[name];
    }

    getComponents(): C[] {
        return Object.values(this._componentChildren || {});
    }

    hasComponent(name: string): boolean {
        return !!(this._componentChildren || {})[name];
    }

    addComponent<T extends C>(
        name: string,
        componentClass: T | ComponentClass<T, O>,
    ): T {
        if (!this._componentChildren) {
            this._componentChildren = {};
        }

        if (this._componentChildren[name]) {
            // Component already added so we will return the existing component
            // TODO: add better logging around this because it could be unexpected but shouldn't be fatal
            // See https://github.com/TypeStrong/typedoc/issues/846
            return <T>this._componentChildren[name];
        } else {
            const component: T =
                typeof componentClass === "function"
                    ? new (<ComponentClass<T>>componentClass)(this)
                    : componentClass;
            const event = new ComponentEvent(
                ComponentEvent.ADDED,
                this,
                component,
            );

            this.bubble(event);
            this._componentChildren[name] = component;

            return component;
        }
    }

    removeComponent(name: string): C | undefined {
        const component = (this._componentChildren || {})[name];
        if (component) {
            delete this._componentChildren![name];
            component.stopListening();
            this.bubble(
                new ComponentEvent(ComponentEvent.REMOVED, this, component),
            );
            return component;
        }
    }

    removeAllComponents() {
        for (const component of Object.values(this._componentChildren || {})) {
            component.stopListening();
        }

        this._componentChildren = {};
    }
}
