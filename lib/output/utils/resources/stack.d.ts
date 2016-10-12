export interface IResourceClass<T extends Resource> extends Function {
    new (origin: ResourceOrigin<T>, name: string, fileName: string): T;
}
export interface IResourceMap<T extends Resource> {
    [name: string]: T;
}
export declare abstract class Resource {
    protected origin: ResourceOrigin<any>;
    protected name: string;
    protected fileName: string;
    constructor(origin: ResourceOrigin<any>, name: string, fileName: string);
    getName(): string;
}
export declare class ResourceOrigin<T extends Resource> {
    private stack;
    private name;
    private path;
    private resources;
    constructor(stack: ResourceStack<T>, name: string, path: string);
    mergeResources(target: IResourceMap<T>): void;
    hasResource(name: string): boolean;
    getResource(name: string): T;
    getName(): string;
    private findResources(dir?);
}
export declare abstract class ResourceStack<T extends Resource> {
    private isActive;
    private ressourceClass;
    private ressourceRegExp;
    private origins;
    constructor(ressourceClass: IResourceClass<T>, ressourceRegExp?: RegExp);
    activate(): boolean;
    deactivate(): boolean;
    getResource(name: string): T;
    getAllResources(): IResourceMap<T>;
    getResourceClass(): IResourceClass<T>;
    getRessourceRegExp(): RegExp;
    getOrigin(name: string): ResourceOrigin<T>;
    hasOrigin(name: string): boolean;
    addOrigin(name: string, path: string, ignoreErrors?: boolean): void;
    removeOrigin(name: string): void;
    removeAllOrigins(): void;
}
