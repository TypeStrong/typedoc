module TypeDoc.Output
{
    export class BaseTheme
    {
        renderer:Renderer;

        basePath:string;


        constructor(renderer:Renderer, basePath:string) {
            this.renderer = renderer;
            this.basePath = basePath;

            this.initialize();
        }


        initialize() {

        }


        isOutputDirectory(dirname:string):boolean {
            return false;
        }


        getUrls(project:Models.ProjectReflection):Models.UrlMapping[] {
            return [];
        }


        getNavigation(project:Models.ProjectReflection):Models.NavigationItem {
            return null;
        }
    }
}