module td.output
{
    /**
     *
     */
    export class UrlMapping
    {
        url:string;

        model:any;

        template:string;


        constructor(url:string, model:any, template:string) {
            this.url = url;
            this.model = model;
            this.template = template;
        }
    }
}