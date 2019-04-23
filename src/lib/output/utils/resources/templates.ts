import * as Handlebars from 'handlebars';

import { readFile } from '../../../utils/fs';
import { ResourceStack, Resource } from './stack';

export class Template<T = any> extends Resource {
    private template?: Handlebars.TemplateDelegate<T>;

    getTemplate(): Handlebars.TemplateDelegate<T> {
        if (!this.template) {
            const raw = readFile(this.fileName);
            this.template = Handlebars.compile(raw, {
                preventIndent: true
            });
        }

        return this.template;
    }

    render(context: any, options?: any): string {
        const template = this.getTemplate();
        return template(context, options);
    }
}

export class TemplateStack extends ResourceStack<Template> {
    constructor() {
        super(Template, /\.hbs$/);
    }
}

export class PartialStack extends TemplateStack {
    private registeredNames: string[] = [];

    activate(): boolean {
        if (!super.activate()) {
            return false;
        }
        const resources = this.getAllResources();

        for (let name in resources) {
            if (this.registeredNames.includes(name)) {
                continue;
            }
            this.registeredNames.push(name);

            const partial = resources[name];
            const template = partial.getTemplate();
            Handlebars.registerPartial(name, template);
        }

        return true;
    }

    deactivate(): boolean {
        if (!super.deactivate()) {
            return false;
        }

        for (let name of this.registeredNames) {
            Handlebars.unregisterPartial(name);
        }

        this.registeredNames = [];
        return true;
    }
}
