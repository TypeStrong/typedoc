"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const Handlebars = require("handlebars");
const stack_1 = require("./stack");
class Helper extends stack_1.Resource {
    getHelpers() {
        if (!this.helpers) {
            const file = require(this.fileName);
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
    }
}
exports.Helper = Helper;
class HelperStack extends stack_1.ResourceStack {
    constructor() {
        super(Helper, /((?!\.d).{2}|^.{0,1})\.ts$|\.js$/);
        this.registeredNames = [];
        this.addCoreHelpers();
    }
    activate() {
        if (!super.activate()) {
            return false;
        }
        const resources = this.getAllResources();
        for (let resourceName in resources) {
            const helpers = resources[resourceName].getHelpers();
            for (let name in helpers) {
                if (this.registeredNames.includes(name)) {
                    continue;
                }
                this.registeredNames.push(name);
                Handlebars.registerHelper(name, helpers[name]);
            }
        }
        return true;
    }
    deactivate() {
        if (!super.deactivate()) {
            return false;
        }
        for (let name of this.registeredNames) {
            Handlebars.unregisterHelper(name);
        }
        this.registeredNames = [];
        return true;
    }
    addCoreHelpers() {
        this.addOrigin('core', Path.join(__dirname, '..', '..', 'helpers'));
    }
    removeAllOrigins() {
        super.removeAllOrigins();
        this.addCoreHelpers();
    }
}
exports.HelperStack = HelperStack;
//# sourceMappingURL=helpers.js.map