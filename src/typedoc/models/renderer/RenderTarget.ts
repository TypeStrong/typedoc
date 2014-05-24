module TypeDoc.Models
{
    export class RenderTarget extends Event
    {
        project:ProjectReflection;

        dirname:string;

        urls:UrlMapping[];
    }
}