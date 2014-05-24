module TypeDoc.Models
{
    export class CommentTag
    {
        tagName:string;

        paramName:string;

        text:string;


        constructor(tagName:string, paramName?:string, text?:string) {
            this.tagName = tagName;
            this.paramName = paramName || '';
            this.text = text || '';
        }
    }
}