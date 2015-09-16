import {Application} from "../Application";
import {IParameterProvider, IParameter} from "../Options";
import {Converter} from "../converter/converter";
import {Renderer} from "../output/Renderer";
import {EventDispatcher} from "./events";


export interface IComponentHost {
    application:Application;
}

interface IComponent extends AbstractComponent<IComponentHost> {

}


export interface IComponentClass<T extends IComponent> extends Function {
    new(owner:IComponentHost):T;
}


interface IComponentList {
    [name:string]:IComponentClass<IComponent>;
}


interface IComponentRegistry {
    [scope:string]:IComponentList;
}


interface IComponentOptions {
    name?:string;
    childClass?:Function;
}


var childMappings:{host:any, child:Function}[] = [];


export function Component(options:IComponentOptions):ClassDecorator {
    return (target:IComponentClass<IComponent>) => {
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

            for (var childMapping of childMappings) {
                if (!(proto instanceof childMapping.child)) continue;

                var host = childMapping.host;
                var defaults = host._defaultComponents || (host._defaultComponents = {});
                defaults[name] = target;
                break;
            }
        }
    };
}


/**
 * Component base class.
 */
export abstract class AbstractComponent<O extends IComponentHost> extends EventDispatcher implements IComponentHost
{
    /**
     * The owner of this component instance.
     */
    private _componentOwner:O;

    /**
     * The name of this component as set by the @Component decorator.
     */
    private _componentName:string;



    /**
     * Create new Component instance.
     */
    constructor(owner:O) {
        super();
        this._componentOwner = owner;
        this.initialize();
    }


    /**
     * Initialize this component.
     */
    protected initialize() {}


    /**
     * Clean up this component on removal.
     */
    protected remove() {
        this.stopListening();
    }


    get componentName():string {
        return this._componentName;
    }


    /**
     * Return the application / root component instance.
     */
    get application():Application {
        if (this._componentOwner) {
            return this._componentOwner.application;
        } else {
            return null;
        }
    }


    /**
     * Return the owner of this component.
     */
    get owner():O {
        return this._componentOwner;
    }
}


/**
 * Component base class.
 */
export abstract class ChildableComponent<O extends IComponentHost, C extends IComponent> extends AbstractComponent<O> implements IParameterProvider
{
    /**
     *
     */
    private _componentChildren:{[name:string]:C};

    private _defaultComponents:{[name:string]:IComponentClass<C>};


    /**
     * Create new Component instance.
     */
    constructor(owner:O) {
        super(owner);

        for (var name in this._defaultComponents) {
            this.addComponent(name, this._defaultComponents[name]);
        }
    }


    /**
     * Retrieve a plugin instance.
     *
     * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
     */
    getComponent(name:string):C {
        if (this._componentChildren && this._componentChildren[name]) {
            return this._componentChildren[name];
        } else {
            return null;
        }
    }


    hasComponent(name:string):boolean {
        return !!(this._componentChildren && this._componentChildren[name]);
    }


    addComponent(name:string, componentClass:IComponentClass<C>):C {
        if (!this._componentChildren) this._componentChildren = {};
        if (this._componentChildren[name]) {
            return null;
        } else {
            return this._componentChildren[name] = new componentClass(this);
        }
    }


    removeComponent(name:string):C {
        if (!this._componentChildren) return null;
        var component = this._componentChildren[name];
        if (component) {
            delete this._componentChildren[name];
            component.stopListening();
            return component;
        } else {
            return null;
        }
    }


    removeAllComponents() {
        if (!this._componentChildren) return;
        for (var name in this._componentChildren) {
            this._componentChildren[name].stopListening();
        }

        this._componentChildren = {};
    }


    getParameters():IParameter[] {
        var result:IParameter[] = [];
        for (var key in this._componentChildren) {
            var plugin:IParameterProvider = <any>this._componentChildren[key];
            if (plugin.getParameters) {
                result.push.call(result, plugin.getParameters());
            }
        }

        return result;
    }
}
