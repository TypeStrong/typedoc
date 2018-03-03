"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FS = require("fs");
var Path = require("path");
var Util = require("util");
function normalizeName(name) {
    return name.replace('\\', '/').replace(/\.\w+$/, '');
}
var Resource = (function () {
    function Resource(origin, name, fileName) {
        this.origin = origin;
        this.name = name;
        this.fileName = fileName;
    }
    Resource.prototype.getName = function () {
        return this.name;
    };
    return Resource;
}());
exports.Resource = Resource;
var ResourceOrigin = (function () {
    function ResourceOrigin(stack, name, path) {
        this.resources = {};
        this.stack = stack;
        this.name = name;
        this.path = path;
        this.findResources();
    }
    ResourceOrigin.prototype.mergeResources = function (target) {
        var resources = this.resources;
        for (var name_1 in resources) {
            if (name_1 in target) {
                continue;
            }
            target[name_1] = resources[name_1];
        }
    };
    ResourceOrigin.prototype.hasResource = function (name) {
        return name in this.resources;
    };
    ResourceOrigin.prototype.getResource = function (name) {
        if (name in this.resources) {
            return this.resources[name];
        }
        else {
            return null;
        }
    };
    ResourceOrigin.prototype.getName = function () {
        return this.name;
    };
    ResourceOrigin.prototype.findResources = function (dir) {
        var resourceClass = this.stack.getResourceClass();
        var ressourceRegExp = this.stack.getRessourceRegExp();
        var path = this.path;
        if (dir) {
            path = Path.join(path, dir);
        }
        for (var _i = 0, _a = FS.readdirSync(path); _i < _a.length; _i++) {
            var fileName = _a[_i];
            var fullName = Path.join(path, fileName);
            if (FS.statSync(fullName).isDirectory()) {
                this.findResources(dir ? Path.join(dir, fileName) : fileName);
            }
            else if (ressourceRegExp.test(fileName)) {
                var name_2 = normalizeName(dir ? Path.join(dir, fileName) : fileName);
                this.resources[name_2] = new resourceClass(this, name_2, fullName);
            }
        }
    };
    return ResourceOrigin;
}());
exports.ResourceOrigin = ResourceOrigin;
var ResourceStack = (function () {
    function ResourceStack(ressourceClass, ressourceRegExp) {
        this.origins = [];
        this.ressourceClass = ressourceClass;
        this.ressourceRegExp = ressourceRegExp || /.*/;
    }
    ResourceStack.prototype.activate = function () {
        if (this.isActive) {
            return false;
        }
        this.isActive = true;
        return true;
    };
    ResourceStack.prototype.deactivate = function () {
        if (!this.isActive) {
            return false;
        }
        this.isActive = false;
        return true;
    };
    ResourceStack.prototype.getResource = function (name) {
        var normalizedName = normalizeName(name);
        var index = this.origins.length - 1;
        while (index >= 0) {
            var origin = this.origins[index--];
            if (origin.hasResource(normalizedName)) {
                return origin.getResource(normalizedName);
            }
        }
        throw new Error(Util.format('Cannot find resource `%s`.', name));
    };
    ResourceStack.prototype.getAllResources = function () {
        var resources = {};
        var index = this.origins.length - 1;
        while (index >= 0) {
            this.origins[index--].mergeResources(resources);
        }
        return resources;
    };
    ResourceStack.prototype.getResourceClass = function () {
        return this.ressourceClass;
    };
    ResourceStack.prototype.getRessourceRegExp = function () {
        return this.ressourceRegExp;
    };
    ResourceStack.prototype.getOrigin = function (name) {
        for (var _i = 0, _a = this.origins; _i < _a.length; _i++) {
            var origin = _a[_i];
            if (origin.getName() === name) {
                return origin;
            }
        }
        return null;
    };
    ResourceStack.prototype.hasOrigin = function (name) {
        return this.getOrigin(name) !== null;
    };
    ResourceStack.prototype.addOrigin = function (name, path, ignoreErrors) {
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
    };
    ResourceStack.prototype.removeOrigin = function (name) {
        if (this.isActive) {
            throw new Error('Cannot remove origins while the resource is active.');
        }
        var index = 0, count = this.origins.length;
        while (index < count) {
            var origin = this.origins[index];
            if (origin.getName() === name) {
                this.origins.splice(index, 1);
                count -= 1;
            }
            else {
                index += 1;
            }
        }
    };
    ResourceStack.prototype.removeAllOrigins = function () {
        if (this.isActive) {
            throw new Error('Cannot remove origins while the resource is active.');
        }
        this.origins = [];
    };
    return ResourceStack;
}());
exports.ResourceStack = ResourceStack;
//# sourceMappingURL=stack.js.map