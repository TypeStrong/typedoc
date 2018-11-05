import * as FS from 'fs';
import * as Path from 'path';
import * as Util from 'util';

export interface ResourceClass<T extends Resource> extends Function {
    new (origin: ResourceOrigin<T>, name: string, fileName: string): T;
}

export interface ResourceMap<T extends Resource> {
    [name: string]: T;
}

/**
 * Normalize the given template name.
 */
function normalizeName(name: string): string {
    return name.replace('\\', '/').replace(/\.\w+$/, '');
}

export abstract class Resource {
    protected origin: ResourceOrigin<any>;

    protected name: string;

    protected fileName: string;

    constructor(origin: ResourceOrigin<any>, name: string, fileName: string) {
        this.origin   = origin;
        this.name     = name;
        this.fileName = fileName;
    }

    getName(): string {
        return this.name;
    }
}

export class ResourceOrigin<T extends Resource> {
    private stack: ResourceStack<T>;

    private name: string;

    private path: string;

    private resources: ResourceMap<T> = {};

    constructor(stack: ResourceStack<T>, name: string, path: string) {
        this.stack = stack;
        this.name  = name;
        this.path  = path;

        this.findResources();
    }

    mergeResources(target: ResourceMap<T>) {
        const resources = this.resources;
        for (let name in resources) {
            if (name in target) {
                continue;
            }
            target[name] = resources[name];
        }
    }

    hasResource(name: string): boolean {
        return name in this.resources;
    }

    getResource(name: string): T | undefined {
        return this.resources[name];
    }

    getName(): string {
        return this.name;
    }

    private findResources(dir?: string) {
        const resourceClass   = this.stack.getResourceClass();
        const resourceRegExp = this.stack.getResourceRegExp();
        let path = this.path;
        if (dir) {
            path = Path.join(path, dir);
        }

        for (let fileName of FS.readdirSync(path)) {
            const fullName = Path.join(path, fileName);

            if (FS.statSync(fullName).isDirectory()) {
                this.findResources(dir ? Path.join(dir, fileName) : fileName);
            } else if (resourceRegExp.test(fileName)) {
                const name: string = normalizeName(dir ? Path.join(dir, fileName) : fileName);
                this.resources[name] = new resourceClass(this, name, fullName);
            }
        }
    }
}

export abstract class ResourceStack<T extends Resource> {
    private isActive = false;

    private resourceClass: ResourceClass<T>;

    private resourceRegExp: RegExp;

    /**
     * A list of all source directories.
     */
    private origins: ResourceOrigin<T>[] = [];

    constructor(resourceClass: ResourceClass<T>, resourceRegExp?: RegExp) {
        this.resourceClass  = resourceClass;
        this.resourceRegExp = resourceRegExp || /.*/;
    }

    activate(): boolean {
        if (this.isActive) {
            return false;
        }
        this.isActive = true;
        return true;
    }

    deactivate(): boolean {
        if (!this.isActive) {
            return false;
        }
        this.isActive = false;
        return true;
    }

    /**
     * Return a resource by its name.
     */
    getResource(name: string): T | undefined {
        const normalizedName = normalizeName(name);
        let index = this.origins.length - 1;

        while (index >= 0) {
            const origin = this.origins[index--];
            if (origin.hasResource(normalizedName)) {
                return origin.getResource(normalizedName);
            }
        }

        throw new Error(Util.format('Cannot find resource `%s`.', name));
    }

    getAllResources(): ResourceMap<T> {
        const resources: ResourceMap<T> = {};
        let index = this.origins.length - 1;

        while (index >= 0) {
            this.origins[index--].mergeResources(resources);
        }

        return resources;
    }

    getResourceClass(): ResourceClass<T> {
        return this.resourceClass;
    }

    getResourceRegExp(): RegExp {
        return this.resourceRegExp;
    }

    getOrigin(name: string): ResourceOrigin<T> | undefined {
        for (let origin of this.origins) {
            if (origin.getName() === name) {
                return origin;
            }
        }
    }

    hasOrigin(name: string): boolean {
        return !!this.getOrigin(name);
    }

    /**
     * Add a source directory to the resource stack.
     */
    addOrigin(name: string, path: string, ignoreErrors?: boolean) {
        if (this.isActive) {
            throw new Error('Cannot add origins while the resource is active.');
        }

        if (this.hasOrigin(name)) {
            throw new Error(Util.format('The origin `%s` is already registered.', name));
        }

        path = Path.resolve(path);
        if (!FS.existsSync(path)) {
            if (!ignoreErrors) {
                throw new Error(Util.format('The resource path `%s` does not exist.', path));
            }
            return;
        }

        if (!FS.statSync(path).isDirectory()) {
            if (!ignoreErrors) {
                throw new Error(Util.format('The resource path `%s` is not a directory.', path));
            }
            return;
        }

        this.origins.push(new ResourceOrigin<T>(this, name, path));
    }

    removeOrigin(name: string) {
        if (this.isActive) {
            throw new Error('Cannot remove origins while the resource is active.');
        }

        let index = 0, count = this.origins.length;
        while (index < count) {
            const origin = this.origins[index];
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
            throw new Error('Cannot remove origins while the resource is active.');
        }

        this.origins = [];
    }
}
