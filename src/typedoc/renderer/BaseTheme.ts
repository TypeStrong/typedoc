module TypeDoc.Renderer
{
    export class BaseTheme
    {
        renderer:Renderer;

        project:Models.ProjectReflection;

        basePath:string;


        constructor(renderer:Renderer, project:Models.ProjectReflection, basePath:string) {
            this.renderer = renderer;
            this.basePath = basePath;
            this.project  = project;

            this.initialize();
        }


        initialize() {

        }


        isOutputDirectory(dirname:string):boolean {
            return false;
        }


        getUrls():Models.UrlMapping[] {
            return [];
        }


        getNavigation():Models.NavigationItem {
            return null;
        }
    }
}