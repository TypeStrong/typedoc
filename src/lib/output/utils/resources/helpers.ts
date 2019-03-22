import * as Path from 'path';
import * as Handlebars from 'handlebars';

import { ResourceStack, Resource } from './stack';

export class Helper extends Resource {
    private helpers: any;

    getHelpers(): any {
        if (!this.helpers) {
            const file = require(this.fileName);

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

export class HelperStack extends ResourceStack<Helper> {
    private registeredNames: string[] = [];

    constructor() {
        // Include .ts files so that tests run with ts-node work.
        // Exclude .d.ts files so that declaration files are not included after compilation.
        // Once lookbehind assertions are supported by all supported Node versions replace with /(?<!\.d)\.ts$|\.js$/
        super(Helper, /((?!\.d).{2}|^.{0,1})\.ts$|\.js$/);
        this.addCoreHelpers();
    }

    activate(): boolean {
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

    deactivate(): boolean {
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
