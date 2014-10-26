module TypeDoc.Output
{
    /**
     * A plugin that generates a table of contents for the current page.
     *
     * The table of contents will start at the nearest module or dynamic module. This plugin
     * sets the [[OutputPageEvent.toc]] property.
     */
    export class TocPlugin extends BasePlugin
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
            if (!(model instanceof Models.BaseReflection)) {
                return;
            }

            var trail = [];
            while (!(model instanceof Models.ProjectReflection) && !model.kindOf(TypeScript.PullElementKind.SomeContainer)) {
                trail.unshift(model);
                model = model.parent;
            }

            page.toc = new Models.NavigationItem();
            TocPlugin.buildToc(model, trail, page.toc);
        }


        /**
         * Create a toc navigation item structure.
         *
         * @param model   The models whose children should be written to the toc.
         * @param trail   Defines the active trail of expanded toc entries.
         * @param parent  The parent [[Models.NavigationItem]] the toc should be appended to.
         */
        static buildToc(model:Models.DeclarationReflection, trail:Models.DeclarationReflection[], parent:Models.NavigationItem) {
            var index = trail.indexOf(model);
            if (index < trail.length - 1 && model.children.length > 40) {
                var child = trail[index + 1];
                var item = Models.NavigationItem.create(child, parent, true);
                item.isInPath  = true;
                item.isCurrent = false;
                TocPlugin.buildToc(child, trail, item);
            } else {
                model.children.forEach((child:Models.DeclarationReflection) => {
                    if (child.kindOf(TypeScript.PullElementKind.SomeContainer)) {
                        return;
                    }

                    var item = Models.NavigationItem.create(child, parent, true);
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
    Renderer.PLUGIN_CLASSES.push(TocPlugin);
}
