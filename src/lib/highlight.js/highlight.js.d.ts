declare module "highlight.js"
{
    interface IHighlightResult {
        value:string;
    }


    function highlight(lang:string, code:string):IHighlightResult;
    function highlightAuto(code:string):IHighlightResult;
}