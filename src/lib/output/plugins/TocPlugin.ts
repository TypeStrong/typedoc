import {Renderer} from "../Renderer";
import {RendererPlugin} from "../RendererPlugin";
import {OutputPageEvent} from "../events/OutputPageEvent";
import {Reflection, ReflectionKind} from "../../models/Reflection";
import {ProjectReflection} from "../../models/reflections/ProjectReflection";
import {NavigationItem} from "../models/NavigationItem";
import {DeclarationReflection} from "../../models/reflections/DeclarationReflection";


/**
 * A plugin that generates a table of contents for the current page.
 *
 * The table of contents will start at the nearest module or dynamic module. This plugin
 * sets the [[OutputPageEvent.toc]] property.
 */
export class TocPlugin extends RendererPlugin
{
    /**
     * Create a new TocPlugin instance.
     *
     * @param renderer  The renderer this plugin should be attached to.
     */
    constructor(renderer:Renderer) {
        super(renderer);
        renderer.on(Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }


    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    private onRendererBeginPage(page:OutputPageEvent) {
        var model = page.model;
        if (!(model instanceof Reflection)) {
            return;
        }

        var trail:Reflection[] = [];
        while (!(model instanceof ProjectReflection) && !model.kindOf(ReflectionKind.SomeModule)) {
            trail.unshift(model);
            model = model.parent;
        }

        page.toc = new NavigationItem();
        TocPlugin.buildToc(model, trail, page.toc);
    }


    /**
     * Create a toc navigation item structure.
     *
     * @param model   The models whose children should be written to the toc.
     * @param trail   Defines the active trail of expanded toc entries.
     * @param parent  The parent [[NavigationItem]] the toc should be appended to.
     */
    static buildToc(model:Reflection, trail:Reflection[], parent:NavigationItem) {
        var index = trail.indexOf(model);
        var children = model['children'] || [];

        if (index < trail.length - 1 && children.length > 40) {
            var child = trail[index + 1];
            var item = NavigationItem.create(child, parent, true);
            item.isInPath  = true;
            item.isCurrent = false;
            TocPlugin.buildToc(child, trail, item);
        } else {
            children.forEach((child:DeclarationReflection) => {
                if (child.kindOf(ReflectionKind.SomeModule)) {
                    return;
                }

                var item = NavigationItem.create(child, parent, true);
                if (trail.indexOf(child) != -1) {
                    item.isInPath  = true;
                    item.isCurrent = (trail[trail.length - 1] == child);
                    TocPlugin.buildToc(child, trail, item);
                }
            });
        }
    }
}


/**
 * Register this plugin.
 */
Renderer.registerPlugin('toc', TocPlugin);
