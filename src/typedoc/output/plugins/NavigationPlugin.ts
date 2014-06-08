module TypeDoc.Output
{
    export class NavigationPlugin extends BasePlugin
    {
        navigation:Models.NavigationItem;

        location:string;


        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on('beginTarget', (t) => this.onRendererBeginTarget(t));
            renderer.on('beginOutput', (o) => this.onRendererBeginOutput(o));
        }


        private onRendererBeginTarget(target:Models.RenderTarget) {
            this.navigation = this.renderer.theme.getNavigation(target.project);

            Handlebars.registerHelper('relativeURL', (url:string) => {
                var relativePath = Path.relative(Path.dirname(this.location), Path.dirname(url));
                return Path.join(relativePath, Path.basename(url)).replace(/\\/g, '/');
            });
        }


        private onRendererBeginOutput(output:Models.RenderOutput) {
            var currentItems:Models.NavigationItem[] = [];
            var secondary:Models.NavigationItem[] = [];
            function updateItem(item:Models.NavigationItem) {
                item.isCurrent = false;
                item.isInPath = false;
                if (item.url == output.url) {
                    currentItems.push(item);
                }

                if (item.children) {
                    item.children.forEach((child) => {
                        updateItem(child);
                    });
                }
            }

            updateItem(this.navigation);
            currentItems.forEach((item:Models.NavigationItem) => {
                item.isCurrent = true;

                var primary = item;
                while (primary && !primary.isPrimary) {
                    primary = primary.parent;
                }
                if (primary) secondary.push(primary);

                while (item) {
                    item.isInPath = true;
                    item = item.parent;
                }
            });

            this.location     = output.url;
            output.navigation = this.navigation;
            output.secondary  = secondary;
        }
    }


    Renderer.PLUGIN_CLASSES.push(NavigationPlugin);
}