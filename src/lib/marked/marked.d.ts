declare module "marked" {
    module marked {
        function setOptions(options:IMarkedOptions);

        interface IMarkedOptions {
            renderer?:any;
            highlight?:any;
            gfm?:boolean;
            tables?:boolean;
            breaks?:boolean;
            pedantic?:boolean;
            sanitize?:boolean;
            smartLists?:boolean;
            smartypants?:boolean;
        }

        interface IMarkedCallback {
            (error:string, content:string):void;
        }
    }

    function marked(markdownString:string, options?:marked.IMarkedOptions):string;
    function marked(markdownString:string, callback:marked.IMarkedCallback):void;
    function marked(markdownString:string, options:marked.IMarkedOptions, callback:marked.IMarkedCallback):void;

    export = marked;
}
