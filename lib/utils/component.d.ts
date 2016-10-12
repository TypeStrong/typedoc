import { Application } from "../application";
import { EventDispatcher, Event, IEventMap } from "./events";
import { IOptionDeclaration } from "./options/declaration";
export interface IComponentHost {
    application: Application;
}
export interface IComponent extends AbstractComponent<IComponentHost> {
}
export interface IComponentClass<T extends IComponent> extends Function {
    new (owner: IComponentHost): T;
}
export interface IComponentOptions {
    name?: string;
    childClass?: Function;
    internal?: boolean;
}
export declare function Component(options: IComponentOptions): ClassDecorator;
export declare function Option(options: IOptionDeclaration): PropertyDecorator;
export declare class ComponentEvent extends Event {
    owner: IComponentHost;
    component: AbstractComponent<IComponentHost>;
    static ADDED: string;
    static REMOVED: string;
    constructor(name: string, owner: IComponentHost, component: AbstractComponent<IComponentHost>);
}
export declare abstract class AbstractComponent<O extends IComponentHost> extends EventDispatcher implements IComponentHost {
    private _componentOwner;
    componentName: string;
    private _componentOptions;
    constructor(owner: O);
    protected initialize(): void;
    protected bubble(name: Event | IEventMap | string, ...args: any[]): this;
    getOptionDeclarations(): IOptionDeclaration[];
    readonly application: Application;
    readonly owner: O;
}
export declare abstract class ChildableComponent<O extends IComponentHost, C extends IComponent> extends AbstractComponent<O> {
    private _componentChildren;
    private _defaultComponents;
    constructor(owner: O);
    getComponent(name: string): C;
    getComponents(): C[];
    hasComponent(name: string): boolean;
    addComponent<T extends C & IComponent>(name: string, componentClass: T | IComponentClass<T>): T;
    removeComponent(name: string): C;
    removeAllComponents(): void;
}
