import { Component, AbstractComponent } from "../utils/component";
import { ProjectReflection, DeclarationReflection } from "../models/reflections/index";
import { Renderer } from "./renderer";
import { RendererEvent, PageEvent } from "./events";
export { Component };
export declare abstract class RendererComponent extends AbstractComponent<Renderer> {
}
export declare abstract class ContextAwareRendererComponent extends RendererComponent {
    protected project: ProjectReflection;
    protected reflection: DeclarationReflection;
    private location;
    protected initialize(): void;
    getRelativeUrl(absolute: string): string;
    protected onBeginRenderer(event: RendererEvent): void;
    protected onBeginPage(page: PageEvent): void;
}
