import * as Path from "path";
import * as Handlebars from "handlebars";

import {ResourceStack, Resource} from "./stack";


export class Helper extends Resource
{
    private helpers:any;


    getHelpers():any {
        if (!this.helpers) {
            var file = require(this.fileName);

            if (typeof file === 'object') {
                this.helpers = file;
            } else if (typeof file === 'function') {
                this.helpers = file();
            } else {
                throw new Error('Invalid helper.');
            }
        }

        return this.helpers;
    }
}


export class HelperStack extends ResourceStack<Helper>
{
    private registeredNames:string[] = [];


    constructor() {
        super(Helper, /\.js$/);
        this.addCoreHelpers();
    }


    activate():boolean {
        if (!super.activate()) return false;
        var resources = this.getAllResources();

        for (var resourceName in resources) {
            var helpers = resources[resourceName].getHelpers();

            for (var name in helpers) {
                if (this.registeredNames.indexOf(name) !== -1) continue;
                this.registeredNames.push(name);

                Handlebars.registerHelper(name, helpers[name]);
            }
        }

        return true;
    }


    deactivate():boolean {
        if (!super.activate()) return false;

        for (var name of this.registeredNames) {
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
