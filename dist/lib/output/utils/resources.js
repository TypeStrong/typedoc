"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FS = require("fs");
var Path = require("path");
var Util = require("util");
var helpers_1 = require("./resources/helpers");
var templates_1 = require("./resources/templates");
var renderer_1 = require("../renderer");
var Resources = (function () {
    function Resources(theme) {
        this.theme = theme;
        this.templates = new templates_1.TemplateStack();
        this.layouts = new templates_1.TemplateStack();
        this.partials = new templates_1.PartialStack();
        this.helpers = new helpers_1.HelperStack();
        this.addDirectory('default', renderer_1.Renderer.getDefaultTheme());
        this.addDirectory('theme', theme.basePath);
    }
    Resources.prototype.activate = function () {
        if (this.isActive) {
            return false;
        }
        this.isActive = true;
        this.partials.activate();
        this.helpers.activate();
        return true;
    };
    Resources.prototype.deactivate = function () {
        if (!this.isActive) {
            return false;
        }
        this.isActive = false;
        this.partials.deactivate();
        this.helpers.deactivate();
        return true;
    };
    Resources.prototype.getTheme = function () {
        return this.theme;
    };
    Resources.prototype.addDirectory = function (name, path) {
        if (this.isActive) {
            throw new Error('Cannot add directories while the resource is active.');
        }
        path = Path.resolve(path);
        if (!FS.existsSync(path)) {
            throw new Error(Util.format('The theme path `%s` does not exist.', path));
        }
        if (!FS.statSync(path).isDirectory()) {
            throw new Error(Util.format('The theme path `%s` is not a directory.', path));
        }
        this.templates.addOrigin(name, Path.join(path, 'templates'), true);
        this.layouts.addOrigin(name, Path.join(path, 'layouts'), true);
        this.partials.addOrigin(name, Path.join(path, 'partials'), true);
        this.helpers.addOrigin(name, Path.join(path, 'helpers'), true);
    };
    Resources.prototype.removeDirectory = function (name) {
        if (this.isActive) {
            throw new Error('Cannot remove directories while the resource is active.');
        }
        this.templates.removeOrigin(name);
        this.layouts.removeOrigin(name);
        this.partials.removeOrigin(name);
        this.helpers.removeOrigin(name);
    };
    Resources.prototype.removeAllDirectories = function () {
        if (this.isActive) {
            throw new Error('Cannot remove directories while the resource is active.');
        }
        this.templates.removeAllOrigins();
        this.layouts.removeAllOrigins();
        this.partials.removeAllOrigins();
        this.helpers.removeAllOrigins();
    };
    return Resources;
}());
exports.Resources = Resources;
//# sourceMappingURL=resources.js.map