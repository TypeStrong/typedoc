"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var Handlebars = require("handlebars");
var stack_1 = require("./stack");
var Helper = (function (_super) {
    __extends(Helper, _super);
    function Helper() {
        _super.apply(this, arguments);
    }
    Helper.prototype.getHelpers = function () {
        if (!this.helpers) {
            var file = require(this.fileName);
            if (typeof file === 'object') {
                this.helpers = file;
            }
            else if (typeof file === 'function') {
                this.helpers = file();
            }
            else {
                throw new Error('Invalid helper.');
            }
        }
        return this.helpers;
    };
    return Helper;
}(stack_1.Resource));
exports.Helper = Helper;
var HelperStack = (function (_super) {
    __extends(HelperStack, _super);
    function HelperStack() {
        _super.call(this, Helper, /\.js$/);
        this.registeredNames = [];
        this.addCoreHelpers();
    }
    HelperStack.prototype.activate = function () {
        if (!_super.prototype.activate.call(this))
            return false;
        var resources = this.getAllResources();
        for (var resourceName in resources) {
            var helpers = resources[resourceName].getHelpers();
            for (var name in helpers) {
                if (this.registeredNames.indexOf(name) !== -1)
                    continue;
                this.registeredNames.push(name);
                Handlebars.registerHelper(name, helpers[name]);
            }
        }
        return true;
    };
    HelperStack.prototype.deactivate = function () {
        if (!_super.prototype.activate.call(this))
            return false;
        for (var _i = 0, _a = this.registeredNames; _i < _a.length; _i++) {
            var name = _a[_i];
            Handlebars.unregisterHelper(name);
        }
        this.registeredNames = [];
        return true;
    };
    HelperStack.prototype.addCoreHelpers = function () {
        this.addOrigin('core', Path.join(__dirname, '..', '..', 'helpers'));
    };
    HelperStack.prototype.removeAllOrigins = function () {
        _super.prototype.removeAllOrigins.call(this);
        this.addCoreHelpers();
    };
    return HelperStack;
}(stack_1.ResourceStack));
exports.HelperStack = HelperStack;
//# sourceMappingURL=helpers.js.map