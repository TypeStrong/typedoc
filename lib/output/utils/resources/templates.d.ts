import { ResourceStack, Resource } from "./stack";
export declare class Template extends Resource {
    private template;
    getTemplate(): HandlebarsTemplateDelegate;
    render(context: any, options?: any): string;
}
export declare class TemplateStack extends ResourceStack<Template> {
    constructor();
}
export declare class PartialStack extends TemplateStack {
    private registeredNames;
    activate(): boolean;
    deactivate(): boolean;
}
