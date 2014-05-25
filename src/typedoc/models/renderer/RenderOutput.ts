module TypeDoc.Models
{
    export class RenderOutput extends Event
    {
        target:RenderTarget;

        filename:string;

        url:string;

        project:any;

        model:any;

        template:{(context:any):string};

        templateName:string;

        navigation:NavigationItem;

        secondary:NavigationItem[];

        contents:string;


        constructor(target:RenderTarget) {
            super();
            this.target = target;
        }
    }
}