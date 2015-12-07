import * as FS from "fs";
import * as Path from "path";
import * as Util from "util";

import {normalizePath} from "../../../utils/fs";


export interface IResourceClass<T extends Resource> extends Function {
    new (origin:ResourceOrigin<T>, name:string, fileName:string):T
}


export interface IResourceMap<T extends Resource> {
    [name:string]:T
}


/**
 * Normalize the given template name.
 */
function normalizeName(name:string):string {
    return name.replace('\\', '/').replace(/\.\w+$/, '');
}


export abstract class Resource
{
    protected origin:ResourceOrigin<any>;

    protected name:string;

    protected fileName:string;


    constructor(origin:ResourceOrigin<any>, name:string, fileName:string) {
        this.origin   = origin;
        this.name     = name;
        this.fileName = fileName;
    }


    getName():string {
        return this.name;
    }
}


export class ResourceOrigin<T extends Resource>
{
    private stack:ResourceStack<T>;

    private name:string;

    private path:string;

    private resources:IResourceMap<T> = {};


    constructor(stack:ResourceStack<T>, name:string, path:string) {
        this.stack = stack;
        this.name  = name;
        this.path  = path;

        this.findResources();
    }


    mergeResources(target:IResourceMap<T>) {
        var resources = this.resources;
        for (var name in resources) {
            if (name in target) continue;
            target[name] = resources[name];
        }
    }


    hasResource(name:string):boolean {
        return name in this.resources;
    }


    getResource(name:string):T {
        if (name in this.resources) {
            return this.resources[name];
        } else {
            return null;
        }
    }


    getName():string {
        return this.name;
    }


    private findResources(dir?:string) {
        var resourceClass   = this.stack.getResourceClass();
        var ressourceRegExp = this.stack.getRessourceRegExp();
        var path = this.path;
        if (dir) path = Path.join(path, dir);

        for (var fileName of FS.readdirSync(path)) {
            var fullName = Path.join(path, fileName);

            if (FS.statSync(fullName).isDirectory()) {
                this.findResources(dir ? Path.join(dir, fileName) : fileName);
            } else if (ressourceRegExp.test(fileName)) {
                var name:string = normalizeName(dir ? Path.join(dir, fileName) : fileName);
                this.resources[name] = new resourceClass(this, name, fullName);
            }
        }
    }
}


export abstract class ResourceStack<T extends Resource>
{
    private isActive:boolean;

    private ressourceClass:IResourceClass<T>;

    private ressourceRegExp:RegExp;

    /**
     * A list of all source directories.
     */
    private origins:ResourceOrigin<T>[] = [];


    constructor(ressourceClass:IResourceClass<T>, ressourceRegExp?:RegExp) {
        this.ressourceClass  = ressourceClass;
        this.ressourceRegExp = ressourceRegExp || /.*/;
    }


    activate():boolean {
        if (this.isActive) return false;
        this.isActive = true;
        return true;
    }


    deactivate():boolean {
        if (!this.isActive) return false;
        this.isActive = false;
        return true;
    }


    /**
     * Return a resource by its name.
     */
    getResource(name:string):T {
        var normalizedName = normalizeName(name);
        var index = this.origins.length - 1;

        while (index >= 0) {
            var origin = this.origins[index--];
            if (origin.hasResource(normalizedName)) {
                return origin.getResource(normalizedName);
            }
        }

        throw new Error(Util.format("Cannot find resource `%s`.", name));
    }


    getAllResources():IResourceMap<T> {
        var resources:IResourceMap<T> = {};
        var index = this.origins.length - 1;

        while (index >= 0) {
            this.origins[index--].mergeResources(resources);
        }

        return resources;
    }


    getResourceClass():IResourceClass<T> {
        return this.ressourceClass;
    }


    getRessourceRegExp():RegExp {
        return this.ressourceRegExp;
    }


    getOrigin(name:string):ResourceOrigin<T> {
        for (var origin of this.origins) {
            if (origin.getName() == name) {
                return origin;
            }
        }

        return null;
    }


    hasOrigin(name:string):boolean {
        return this.getOrigin(name) !== null;
    }


    /**
     * Add a source directory to the resource stack.
     */
    addOrigin(name:string, path:string, ignoreErrors?:boolean) {
        if (this.isActive) {
            throw new Error("Cannot add origins while the resource is active.");
        }

        if (this.hasOrigin(name)) {
            throw new Error(Util.format("The origin `%s` is already registered.", name));
        }

        path = Path.resolve(path);
        if (!FS.existsSync(path)) {
            if (!ignoreErrors) {
                throw new Error(Util.format("The resource path `%s` does not exist.", path));
            }
            return;
        }

        if (!FS.statSync(path).isDirectory()) {
            if (!ignoreErrors) {
                throw new Error(Util.format("The resource path `%s` is not a directory.", path));
            }
            return;
        }

        this.origins.push(new ResourceOrigin<T>(this, name, path));
    }


    removeOrigin(name:string) {
        if (this.isActive) {
            throw new Error("Cannot remove origins while the resource is active.");
        }

        var index = 0, count = this.origins.length;
        while (index < count) {
            var origin = this.origins[index];
            if (origin.getName() === name) {
                this.origins.splice(index, 1);
                count -= 1;
            } else {
                index += 1;
            }
        }
    }


    removeAllOrigins() {
        if (this.isActive) {
            throw new Error("Cannot remove origins while the resource is active.");
        }

        this.origins = [];
    }
}
