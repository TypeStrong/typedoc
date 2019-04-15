"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
const Util = require("util");
function normalizeName(name) {
    return name.replace('\\', '/').replace(/\.\w+$/, '');
}
class Resource {
    constructor(origin, name, fileName) {
        this.origin = origin;
        this.name = name;
        this.fileName = fileName;
    }
    getName() {
        return this.name;
    }
}
exports.Resource = Resource;
class ResourceOrigin {
    constructor(stack, name, path) {
        this.resources = {};
        this.stack = stack;
        this.name = name;
        this.path = path;
        this.findResources();
    }
    mergeResources(target) {
        const resources = this.resources;
        for (let name in resources) {
            if (name in target) {
                continue;
            }
            target[name] = resources[name];
        }
    }
    hasResource(name) {
        return name in this.resources;
    }
    getResource(name) {
        return this.resources[name];
    }
    getName() {
        return this.name;
    }
    findResources(dir) {
        const resourceClass = this.stack.getResourceClass();
        const resourceRegExp = this.stack.getResourceRegExp();
        let path = this.path;
        if (dir) {
            path = Path.join(path, dir);
        }
        for (let fileName of FS.readdirSync(path)) {
            const fullName = Path.join(path, fileName);
            if (FS.statSync(fullName).isDirectory()) {
                this.findResources(dir ? Path.join(dir, fileName) : fileName);
            }
            else if (resourceRegExp.test(fileName)) {
                const name = normalizeName(dir ? Path.join(dir, fileName) : fileName);
                this.resources[name] = new resourceClass(this, name, fullName);
            }
        }
    }
}
exports.ResourceOrigin = ResourceOrigin;
class ResourceStack {
    constructor(resourceClass, resourceRegExp) {
        this.isActive = false;
        this.origins = [];
        this.resourceClass = resourceClass;
        this.resourceRegExp = resourceRegExp || /.*/;
    }
    activate() {
        if (this.isActive) {
            return false;
        }
        this.isActive = true;
        return true;
    }
    deactivate() {
        if (!this.isActive) {
            return false;
        }
        this.isActive = false;
        return true;
    }
    getResource(name) {
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
    getAllResources() {
        const resources = {};
        let index = this.origins.length - 1;
        while (index >= 0) {
            this.origins[index--].mergeResources(resources);
        }
        return resources;
    }
    getResourceClass() {
        return this.resourceClass;
    }
    getResourceRegExp() {
        return this.resourceRegExp;
    }
    getOrigin(name) {
        for (let origin of this.origins) {
            if (origin.getName() === name) {
                return origin;
            }
        }
    }
    hasOrigin(name) {
        return !!this.getOrigin(name);
    }
    addOrigin(name, path, ignoreErrors) {
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
        this.origins.push(new ResourceOrigin(this, name, path));
    }
    removeOrigin(name) {
        if (this.isActive) {
            throw new Error('Cannot remove origins while the resource is active.');
        }
        let index = 0, count = this.origins.length;
        while (index < count) {
            const origin = this.origins[index];
            if (origin.getName() === name) {
                this.origins.splice(index, 1);
                count -= 1;
            }
            else {
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
exports.ResourceStack = ResourceStack;
//# sourceMappingURL=stack.js.map