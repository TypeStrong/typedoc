import * as Handlebars from "handlebars";

import {readFile} from "../../../utils/fs";
import {ResourceStack, Resource} from "./stack";


export class Template extends Resource
{
    private template:HandlebarsTemplateDelegate;


    getTemplate():HandlebarsTemplateDelegate {
        if (!this.template) {
            var raw = readFile(this.fileName);
            this.template = Handlebars.compile(raw, {
                preventIndent: true
            });
        }

        return this.template;
    }


    render(context:any, options?:any):string {
        var template = this.getTemplate();
        return template(context, options);
    }
}


export class TemplateStack extends ResourceStack<Template>
{
    constructor() {
        super(Template, /\.hbs$/);
    }
}


export class PartialStack extends TemplateStack
{
    private registeredNames:string[] = [];


    activate():boolean {
        if (!super.activate()) return false;
        var resources = this.getAllResources();

        for (var name in resources) {
            if (this.registeredNames.indexOf(name) !== -1) continue;
            this.registeredNames.push(name);

            var partial = resources[name];
            var template = partial.getTemplate();
            Handlebars.registerPartial(name, template);
        }

        return true;
    }


    deactivate():boolean {
        if (!super.deactivate()) return false;

        for (var name of this.registeredNames) {
            Handlebars.unregisterPartial(name);
        }

        this.registeredNames = [];
        return true;
    }
}
