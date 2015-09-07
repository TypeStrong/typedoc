import * as Path from "path";
import {Renderer} from "./Renderer";
import {ProjectReflection} from "../models/reflections/ProjectReflection";
import {DeclarationReflection} from "../models/reflections/DeclarationReflection";
import {OutputEvent} from "./events/OutputEvent";
import {OutputPageEvent} from "./events/OutputPageEvent";


/**
 * Base class of all plugins that can be attached to the [[Renderer]].
 */
export class RendererPlugin
{
    /**
     * The renderer this plugin is attached to.
     */
    protected renderer:Renderer;



    /**
     * Create a new RendererPlugin instance.
     *
     * @param renderer  The renderer this plugin should be attached to.
     */
    constructor(renderer:Renderer) {
        this.renderer = renderer;
    }


    /**
     * Remove this plugin from the renderer.
     */
    remove() {
        this.renderer.off(null, null, this);
    }
}


/**
 * A plugin for the renderer that reads the current render context.
 */
export class ContextAwareRendererPlugin extends RendererPlugin
{
    /**
     * The project that is currently processed.
     */
    protected project:ProjectReflection;

    /**
     * The reflection that is currently processed.
     */
    protected reflection:DeclarationReflection;

    /**
     * The url of the document that is being currently generated.
     */
    private location:string;



    /**
     * Create a new ContextAwareRendererPlugin instance.
     *
     * @param renderer  The renderer this plugin should be attached to.
     */
    constructor(renderer:Renderer) {
        super(renderer);
        renderer.on(Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        renderer.on(Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }


    /**
     * Transform the given absolute path into a relative path.
     *
     * @param absolute  The absolute path to transform.
     * @returns A path relative to the document currently processed.
     */
    public getRelativeUrl(absolute:string):string {
        var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
        return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
    }


    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    protected onRendererBegin(event:OutputEvent) {
        this.project = event.project;
    }


    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    protected onRendererBeginPage(page:OutputPageEvent) {
        this.location   = page.url;
        this.reflection = page.model instanceof DeclarationReflection ? page.model : null;
    }
}
