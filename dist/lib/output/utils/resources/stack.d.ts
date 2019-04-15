export interface ResourceClass<T extends Resource> extends Function {
    new (origin: ResourceOrigin<T>, name: string, fileName: string): T;
}
export interface ResourceMap<T extends Resource> {
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
    mergeResources(target: ResourceMap<T>): void;
    hasResource(name: string): boolean;
    getResource(name: string): T | undefined;
    getName(): string;
    private findResources;
}
export declare abstract class ResourceStack<T extends Resource> {
    private isActive;
    private resourceClass;
    private resourceRegExp;
    private origins;
    constructor(resourceClass: ResourceClass<T>, resourceRegExp?: RegExp);
    activate(): boolean;
    deactivate(): boolean;
    getResource(name: string): T | undefined;
    getAllResources(): ResourceMap<T>;
    getResourceClass(): ResourceClass<T>;
    getResourceRegExp(): RegExp;
    getOrigin(name: string): ResourceOrigin<T> | undefined;
    hasOrigin(name: string): boolean;
    addOrigin(name: string, path: string, ignoreErrors?: boolean): void;
    removeOrigin(name: string): void;
    removeAllOrigins(): void;
}
