declare module "highlight.js"
{
    interface IHighlightResult {
        value:string;
    }


    function registerLanguage(name:string, language:any);
    function highlight(lang:string, code:string):IHighlightResult;
    function highlightAuto(code:string):IHighlightResult;
}