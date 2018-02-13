import { Application } from '../application';
import { EventDispatcher, Event, EventMap } from './events';
import { DeclarationOption } from './options/declaration';
export interface ComponentHost {
    application: Application;
}
export interface Component extends AbstractComponent<ComponentHost> {
}
export interface ComponentClass<T extends Component> extends Function {
    new (owner: ComponentHost): T;
}
export interface ComponentOptions {
    name?: string;
    childClass?: Function;
    internal?: boolean;
}
export declare function Component(options: ComponentOptions): ClassDecorator;
export declare function Option(options: DeclarationOption): PropertyDecorator;
export declare class ComponentEvent extends Event {
    owner: ComponentHost;
    component: AbstractComponent<ComponentHost>;
    static ADDED: string;
    static REMOVED: string;
    constructor(name: string, owner: ComponentHost, component: AbstractComponent<ComponentHost>);
}
export declare abstract class AbstractComponent<O extends ComponentHost> extends EventDispatcher implements ComponentHost {
    private _componentOwner;
    componentName: string;
    private _componentOptions;
    constructor(owner: O);
    protected initialize(): void;
    protected bubble(name: Event | EventMap | string, ...args: any[]): this;
    getOptionDeclarations(): DeclarationOption[];
    readonly application: Application;
    readonly owner: O;
}
export declare abstract class ChildableComponent<O extends ComponentHost, C extends Component> extends AbstractComponent<O> {
    private _componentChildren;
    private _defaultComponents;
    constructor(owner: O);
    getComponent(name: string): C;
    getComponents(): C[];
    hasComponent(name: string): boolean;
    addComponent<T extends C & Component>(name: string, componentClass: T | ComponentClass<T>): T;
    removeComponent(name: string): C;
    removeAllComponents(): void;
}
